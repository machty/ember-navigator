// tests/unit/routes/index-test.js
import { test, module, skip } from 'ember-qunit';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/combineLatest';

import Ember from 'ember';
const { run, RSVP } = Ember;

const EMBER_SCHEDULER = {
  schedule(action) {
    run.schedule('actions', action.context, action.method);
  }
};

module("Unit - McRIB", {
  beforeEach: function () {
    // engine = new DataEngine(EMBER_SCHEDULER);
    // events = [];
    // engine.eventDelegate = (ev) => events.push(ev);
  },
  afterEach: function () {}
});

const DependencyValidation = Ember.Object.extend({
  validate() {
  }
});


const Dependency = DependencyValidation.extend({
  validate(obj, key) {
    throw new Error(`missing dependency: ${key}`);
  }
});

const Builder = DependencyValidation.extend({
  validate(object, key) {
    if (object._builders[key]) {
      throw new Error(`duplicate builder: ${key}`);
    }
    object._builders[key] = this;
  }
});

const Node = Ember.Object.extend({
  _builders: null,
  init(...args) {
    this._super(...args);
    this._builders = {};
    this._checkDependencies();
  },

  _checkDependencies() {
    for (let key in this) {
      let value = this[key];
      if (!(value instanceof DependencyValidation)) {
        continue;
      }

      value.validate(this, key);
    }
  },

  build(childName, attrs = {}) {
    let builder = this._builders[childName];
    if (!(builder instanceof Builder)) {
      throw new Error(`unknown builder: ${childName}`);
    }
    return builder.klass.create(attrs);
  },
});

function dependency() {
  return new Dependency();
}

function builder(klass) {
  return new Builder({ klass });
}

let LoggedInNode = Node.extend({
  user: dependency(),
});

let RootNode = Node.extend({
  loggedIn: builder(LoggedInNode),
});

const user = { username: 'amatchneer' };

test("dependencies are validated on Node creation", function(assert) {
  assert.expect(1);

  run(() => {
    let rootNode = RootNode.create();
    try {
      LoggedInNode.create();
      assert.ok(false, 'exception should have been thrown');
    } catch(e) {
      assert.equal(e.message, `missing dependency: user`);
    }

    let loggedInNode = LoggedInNode.create({ user });
  });
});

test("builders can build child ribs", function(assert) {
  assert.expect(1);

  run(() => {
    // let user = { username: 'amatchneer' };

    let rootNode = RootNode.create();
    let loggedIn = rootNode.build('loggedIn', { user });
    assert.ok(loggedIn instanceof LoggedInNode);
  });
});


/*
class Dependency {
  constructor(resolver, key) {
    this.resolver = resolver;
    this.key = key;
    this.value = null;
  }

  provide(engine, key, value) {
    engine.flush_resolveDependency(this.resolver, PROVIDE_RESULT_FULFILLED, value);
  }

  reject(engine, key, value) {
    engine.flush_resolveDependency(this.resolver, PROVIDE_RESULT_REJECTED, value);
  }

  __handleYield__(engine) {
    engine.flush_registerDependency(this.key, this);
  }
}

class Subscription {
  constructor(key, name, onNext, onError) {
    this.name = name;
    this.key = key;
    this.onNext = onNext;
    this.onError = onError;
  }

  provide(engine, key, value) {
    this.deliver(this.onNext, value);
  }

  reject(engine, key, value) {
    this.deliver(this.onError, value);
  }

  deliver(callback, value) {
    if (callback) {
      callback(value);
    }
  }
}

class ResolverState {
  constructor(key, generator) {
    this.key = key;
    this.generator = generator;
    this.state = RESOLVER_STATE_INACTIVE;
    this.value = null;
    this.dependencies = new window.Set();
    this.iter = null;

    this.context = {
      require: (key) => {
        return new Dependency(this, key);
      }
    }
  }

  flush_start() {
    this.state = RESOLVER_STATE_RUNNING;
    this.iter = this.generator.call(null, this.context);
  }

  flush_resume(engine, resumeValue) {
    let result;
    try {
      result = this.iter.next(resumeValue);
    } catch(e) {
      engine.events.push([EVENT_FAIL_RESOLVER, e, this]);
      return;
    }

    this.flush_handleGeneratorResult(engine, result);
  }

  flush_handleGeneratorResult(engine, result) {
    let { value, done } = result;
    if (done) {
      this.state = RESOLVER_STATE_FULFILLED;

      let observable;
      if (value && typeof value.subscribe === 'function') {
        observable = value;
      } else if (value && typeof value.then === 'function') {
        observable = Observable.fromPromise(value);
      } else {
        observable = Observable.of(value);
      }

      engine.events.push([EVENT_DATA_READY, this.key]);
      this.subscription = observable.subscribe(v => {
        engine.events.push([EVENT_NEW_VALUE, this.key, v, this]);
      });
    } else {
      if (value && typeof value.__handleYield__ === 'function') {
        value.__handleYield__(engine);
      } else if (value && typeof value.then === 'function') {
        // you can kinda think of promises as anonymous dependencies?
        // what about partially applied helpers? we should support that too.
        // require is basically: give me a dependency that requires zero args.
        // what if you want to inject a dependency and _then_ do an observable?
        // you should be able to pass the context somewhere else.
        // IDEA: there should be a 3rd param?

        value.then(resolvedValue => {
          engine.events.push([EVENT_RESUME_RESOLVER, resolvedValue, this]);
          engine.scheduleFlush();
        }, e => {
          engine.events.push([EVENT_FAIL_RESOLVER, e, this]);
          engine.scheduleFlush();
        });
      } else {
        engine.events.push([EVENT_RESUME_RESOLVER, value, this]);
      }
    }
  }
}

class DataEngine {
  constructor(scheduler) {
    this.resolvers = {};
    this.subscriptions = new window.Set();
    this.scheduler = scheduler;
    this.flushAction = {
      context: this,
      method: this.flush
    };
    this.events = [];
    this.requires = {};
    this.providers = {};
    this.eventDelegate = null;
  }

  addResolver(key, generatorFn) {
    return this.resolvers[key] = new ResolverState(key, generatorFn);
  }

  subscribe(key, name, onNext, onError) {
    let subscription = new Subscription(key, name, onNext, onError);
    this.events.push([EVENT_DATA_REQUIRED, key, subscription]);
    this.scheduleFlush();
    return subscription;
  }

  scheduleFlush() {
    this.scheduler.schedule(this.flushAction);
  }

  flush() {
    for (let i = 0; i < this.events.length; ++i) {
      let event = this.events[i];
      if (this.eventDelegate) {
        this.eventDelegate(event);
      }

      let handler = this[event[0]];
      handler.apply(this, event.slice(1));
    }
    this.events = [];
  }

  flush_registerDependency(key, dependency) {
    this.events.push([EVENT_DATA_REQUIRED, key, dependency]);
  }

  flush_resolveDependency(resolver, resolveType, value) {
    // Called when a dependency has resolved, and the resolver that
    // specified that Dependency can now continue running.

    // `resolver` is the resolver that fulfilled / rejected???

    if (resolveType === PROVIDE_RESULT_FULFILLED) {
      this.events.push([EVENT_RESUME_RESOLVER, value, resolver]);
    } else if (resolveType === PROVIDE_RESULT_REJECTED) {
      this.events.push([EVENT_FAIL_RESOLVER, value, resolver]);
    }
  }

  EVENT_DATA_REQUIRED(requiredKey, dependency) {
    // Something has `require()`d a dependency, so keep track of it...
    let requiresForKey = this.requires[requiredKey] = this.requires[requiredKey] || [];
    requiresForKey.push(dependency);

    // ... and look for any resolvers that might be able to fulfill it,
    // and kick them off if necessary.
    let providingResolver = this.resolvers[requiredKey];
    if (!providingResolver) {
      throw new Error(`couldn't find providingResolver for key ${requiredKey}`);
    }

    if (providingResolver.state === RESOLVER_STATE_INACTIVE) {
      providingResolver.flush_start();
      this.events.push([EVENT_RESUME_RESOLVER, null, providingResolver]);
    }
  }

  EVENT_DATA_READY(requiredKey) {
    console.log(`data is ready: ${requiredKey}`)
  }

  EVENT_NEW_VALUE(requiredKey, value) {
    this.flush_publishResult(requiredKey, value, true);
  }

  EVENT_DATA_REJECTED(requiredKey, value) {
    this.flush_publishResult(requiredKey, value, false);
  }

  EVENT_RESUME_RESOLVER(value, resolver) {
    resolver.flush_resume(this, value);
  }

  EVENT_FAIL_RESOLVER(error, resolver) {
    resolver.value = error;
    resolver.state = RESOLVER_STATE_FAILED;
    // TODO: should this actually try and .return() the gen fn?
    // this is weird; the code inside Resolver pushes this event,
    // this event handler mangles the state, externally?
    // Should this state update happen within? Does it matter?
    // Either way, could probably mode this logic inside Resolver.

    this.events.push([EVENT_DATA_REJECTED, resolver.key, error]);

    // TODO: impl pushEvent on engine
  }

  flush_publishResult(requiredKey, value, isSuccess) {
    let requiresForKey = this.requires[requiredKey];
    if (!requiresForKey) {
      console.warn(`unexpected empty requires array for ${requiredKey}`);
    }

    for (let i = 0; i < requiresForKey.length; ++i) {
      let req = requiresForKey[i];
      if (isSuccess) {
        req.provide(this, requiredKey, value);
      } else {
        req.reject(this, requiredKey, value);
      }
    }

    // if (canClear) {
    //   requiresForKey.length = 0;
    // }
  }
}

let engine;
let events;
module("Unit - Data Engine", {
  beforeEach: function () {
    engine = new DataEngine(EMBER_SCHEDULER);
    events = [];
    engine.eventDelegate = (ev) => events.push(ev);
  },
  afterEach: function () {}
});

function eventNames() {
  return events.map(ev => `${ev[0]} ${ev[1]}`);
}


test("adding a resolver doesn't execute unless it's subscribed to", function(assert) {
  assert.expect(0);
  engine.addResolver('a', function * () {
    assert.ok(false);
  });
});

test("subscribing to a single resolver", function(assert) {
  engine.addResolver('a', function * ({ require }) {
    return 'A';
  });

  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      assert.equal(v, 'A');
    });
  });
});

test("subscribing to a single async resolver", function(assert) {
  let defer;
  engine.addResolver('a', function * ({ require }) {
    defer = RSVP.defer();
    let letterA = yield defer.promise;
    return letterA;
  });

  let values = [];
  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      values.push(v);
    });
  });

  assert.deepEqual(values, []);
  run(() => defer.resolve('A'));
  assert.deepEqual(values, ['A']);
});

test("sync dependency chain", function(assert) {
  engine.addResolver('a', function * ({ require }) {
    return 'A';
  });

  engine.addResolver('ab', function * ({ require }) {
    let a = yield require('a');
    return `${a}B`;
  });

  let values = [];
  run(() => {
    engine.subscribe('ab', 'mySubscriber', v => {
      values.push(v);
    });
  });
  assert.deepEqual(values, ['AB']);

  assert.deepEqual(eventNames(), [
    "EVENT_DATA_REQUIRED ab",
    "EVENT_RESUME_RESOLVER null",
    "EVENT_DATA_REQUIRED a",
    "EVENT_RESUME_RESOLVER null",
    "EVENT_DATA_READY a",
    "EVENT_NEW_VALUE a",
    "EVENT_RESUME_RESOLVER A",
    "EVENT_DATA_READY ab",
    "EVENT_NEW_VALUE ab"
  ]);
});

test("async dependency chain", function(assert) {
  let deferA;
  engine.addResolver('a', function * ({ require }) {
    deferA = RSVP.defer();
    let letterA = yield deferA.promise;
    return letterA;
  });

  let deferB;
  engine.addResolver('ab', function * ({ require }) {
    let a = yield require('a');
    deferB = RSVP.defer();
    let letterB = yield deferB.promise;
    return `${a}${letterB}`;
  });

  let values = [];
  run(() => {
    engine.subscribe('ab', 'mySubscriber', v => {
      values.push(v);
    });
  });

  assert.deepEqual(values, []);
  run(() => deferA.resolve('A'));
  assert.deepEqual(values, []);
  run(() => deferB.resolve('B'));
  assert.deepEqual(values, ['AB']);

  assert.deepEqual(eventNames(), [
    "EVENT_DATA_REQUIRED ab",
    "EVENT_RESUME_RESOLVER null",
    "EVENT_DATA_REQUIRED a",
    "EVENT_RESUME_RESOLVER null",
    "EVENT_RESUME_RESOLVER A",
    "EVENT_DATA_READY a",
    "EVENT_NEW_VALUE a",
    "EVENT_RESUME_RESOLVER A",
    "EVENT_RESUME_RESOLVER B",
    "EVENT_DATA_READY ab",
    "EVENT_NEW_VALUE ab"
  ]);
});

test("errors thrown from generator", function(assert) {
  let resolver = engine.addResolver('a', function * ({ require }) {
    throw new Error('wat');
  });

  let values = [];
  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      values.push(v);
    });
  });

  assert.equal(resolver.state, RESOLVER_STATE_FAILED);
  assert.equal(resolver.value.message, 'wat');
});

test("promise rejection", function(assert) {
  let defer;
  let resolver = engine.addResolver('a', function * ({ require }) {
    defer = RSVP.defer();
    yield defer.promise;
  });

  let values = [];
  run(() => {
    engine.subscribe('a', 'mySubscriber', value => {
      values.push({ value });
    }, error => {
      values.push({ error });
    });
  });

  assert.deepEqual(values, []);
  run(() => defer.reject('wat'));
  assert.deepEqual(values, [{ error: 'wat' }]);

  assert.equal(resolver.state, RESOLVER_STATE_FAILED);
  assert.equal(resolver.value, 'wat');

  assert.deepEqual(eventNames(), [
    "EVENT_DATA_REQUIRED a",
    "EVENT_RESUME_RESOLVER null",
    "EVENT_FAIL_RESOLVER wat",
    "EVENT_DATA_REJECTED a"
  ]);
});

test("it handles falsy yields", function(assert) {
  engine.addResolver('a', function * ({ require }) {
    yield null;
  });

  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      assert.equal(v, undefined);
    });
  });
});

skip("it gives you an error (?) or Just Works(?) when you return (vs yield) a promise/Dependency", function(assert) {
  engine.addResolver('a', function * ({ require }) {
    return require('b');
  });

  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      assert.equal(v, undefined);
    });
  });
});

test("observables", function(assert) {
  let subject;
  engine.addResolver('a', function * ({ require }) {
    subject = new ReplaySubject(1);
    subject.next('A');
    return subject;
  });

  run(() => {
    engine.subscribe('a', 'mySubscriber', v => {
      assert.equal(v, 'A')
    });
  });
});

test("routing sketch", function(assert) {
  engine.addResolver('url', function * ({ require }) {
    return "foo/bar"
  });

  let routes = {
    foo: {
      *resolve() {
      }
    },
    bar: {
      *resolve() {
      }
    },
  };

  engine.addResolver('handlerInfos', function * ({ require }) {
    let url = yield require('url');
    return url.split('/').map(name => {
      let route = routes[name];
      return { name, handler: route };
    });
  });

  engine.addResolver('scanThing', function({ require }) {

    return {
      provides: ['foo', 'bar', 'baz'],
      requires: ['parentFoo', 'parentBar'],
      subscribe() {
        return {
        };
      }
    };


    merge([
      require('bullshit'),
    ])


    // return require('borf'),

    // let url = yield require('url');
    // return url.split('/').map(name => {
    //   let route = routes[name];
    //   return { name, handler: route };
    // });
  });

  engine.addResolver('outletState', function * ({ require }) {
    let handlerInfos = yield require('handlerInfos');



    // let url = yield require('url');
    // return url.split('/').map(name => {
    //   let route = routes[name];
    //   return { name, handler: route };
    // });
    return [1,2];
  });

  run(() => {
    engine.subscribe('outletState', 'mySubscriber', handlerInfos => {
      assert.equal(handlerInfos.length, 2);
    });
  });
});

*/
