// tests/unit/routes/index-test.js
import { test, module, skip } from 'ember-qunit';

import Ember from 'ember';
const { run, RSVP } = Ember;

const EMBER_SCHEDULER = {
  schedule(action) {
    run.schedule('actions', action.context, action.method);
  }
};

const RESOLVER_STATE_INACTIVE = 'inactive';
const RESOLVER_STATE_FAILED = 'failed';
const RESOLVER_STATE_FULFILLED = 'fulfilled';
const RESOLVER_STATE_RUNNING = 'running';

const EVENT_DATA_REQUIRED = 'EVENT_DATA_REQUIRED';
const EVENT_DATA_RESOLVED = 'EVENT_DATA_RESOLVED';
const EVENT_RESUME_RESOLVER = 'EVENT_RESUME_RESOLVER';

const PROVIDE_RESULT_STILL_WAITING = 0;
const PROVIDE_RESULT_FULFILLED = 1;

class Dependency {
  constructor(resolver, key) {
    this.resolver = resolver;
    this.key = key;
    this.value = null;
  }

  provide(engine, key, value) {
    if (key !== this.key) {
      throw new Error(`Provided key '${key}' is not the one I was waiting for: ${this.key}`);
    }

    engine.flush_resolveDependency(this.resolver, PROVIDE_RESULT_FULFILLED, value);
  }

  __handleYield__(engine) {
    engine.flush_registerDependency(this.key, this);
  }
}

class Subscription {
  constructor(key, name, callback) {
    this.name = name;
    this.key = key;
    this.callback = callback;
  }

  provide(engine, key, value) {
    this.callback(value);
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
      // TODO: this
      debugger;
    }

    let { value, done } = result;

    if (done) {
      this.state = RESOLVER_STATE_FULFILLED;
      this.value = value;
      engine.events.push([EVENT_DATA_RESOLVED, this.key, value, this]);
    } else {
      if (value.__handleYield__) {
        value.__handleYield__(engine);
      } else if (typeof value.then === 'function') {
        // you can kinda think of promises as anonymous dependencies?
        value.then(resolvedValue => {
          engine.events.push([EVENT_RESUME_RESOLVER, this, resolvedValue]);
          engine.scheduleFlush();
        }, error => {
          console.log("TODO promise errors");
        });
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
  }

  addResolver(key, generatorFn) {
    this.resolvers[key] = new ResolverState(key, generatorFn);
  }

  subscribe(key, name, callback) {
    let subscription = new Subscription(key, name, callback);
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
      console.log(event);
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

    this.events.push([EVENT_RESUME_RESOLVER, resolver, value]);
  }

  EVENT_DATA_REQUIRED(requiredKey, dependency) {
    // Something has `require()`d a dependency, so keep
    // track of it, then look for any resolvers
    // that might be able to fulfill it, and kick them off
    // if necessary.
    let requiresForKey = this.requires[requiredKey] = this.requires[requiredKey] || [];
    requiresForKey.push(dependency);

    let resolver = this.resolvers[requiredKey];
    if (!resolver) {
      throw new Error(`couldn't find resolver for key ${requiredKey}`);
    }

    if (resolver.state === RESOLVER_STATE_INACTIVE) {
      resolver.flush_start();
      this.events.push([EVENT_RESUME_RESOLVER, resolver, null]);
    }
  }

  EVENT_DATA_RESOLVED(requiredKey, value, resolver) {
    let requiresForKey = this.requires[requiredKey];
    if (!requiresForKey) {
      console.warn(`unexpected empty requires array for ${requiredKey}`);
    }

    // let canClear = true;
    for (let i = 0; i < requiresForKey.length; ++i) {
      let req = requiresForKey[i];
      let result = req.provide(this, requiredKey, value);
      // TODO: test requires memory leaks.
    }

    // if (canClear) {
    //   requiresForKey.length = 0;
    // }
  }

  EVENT_RESUME_RESOLVER(resolver, value) {
    resolver.flush_resume(this, value);
  }
}

let engine;
module("Unit - Data Engine", {
  beforeEach: function () {
    engine = new DataEngine(EMBER_SCHEDULER);
  },
  afterEach: function () {}
});

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
});

skip("it handles falsy yields", function(assert) {
});

skip("it gives you an error if you return a Dependency", function(assert) {
});

