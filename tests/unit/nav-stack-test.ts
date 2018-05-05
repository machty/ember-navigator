import { test, module } from 'ember-qunit';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack'
import { createMap } from 'ember-constraint-router/-dsl';
import { guidFor } from '@ember/object/internals';
import Ember from 'ember';

module('Unit - NavStack test');

/*

const Factory = Ember.Object.extend();

const map = createMap(function() {
  this.route('welcome');
  let auth = this.state('auth');
  this.route('user', { path: 'users/:user_id' }, function() {
    this.route('posts');
  });

  this.match(auth, 'admin-user', function() {
    this.route('admin', function() {
      this.route('dashboard');
    });
  });
});

test('it shares states', function (assert) {
  let { scopeTree, frameUpdates, navStack } = buildWorld(map);

  navStack.didUpdateStateString(JSON.stringify([
    { url: "welcome" },
    { url: "welcome" },
  ]));

  assert.deepEqual(scopeTree(frameUpdates.pop()), [
    { "auth": 1, "myRouter": 1, "root": 1, "welcome": 1 },
    { "auth": 1, "myRouter": 2, "root": 1, "welcome": 1 },
  ]);

  assert.equal(frameUpdates.length, 0);
});

test('dynamic param services are keyed by param value', function (assert) {
  let { scopeTree, frameUpdates, navStack } = buildWorld(map);

  navStack.didUpdateStateString(JSON.stringify([
    { url: "users/machty/posts" },
    { url: "users/machty/posts" },
    { url: "users/amatchneer/posts" },
    { url: "users/amatchneer/posts" },
    { url: "users/machty/posts" },
  ]));

  assert.deepEqual(scopeTree(frameUpdates.pop()), [
    { "auth": 1, "myRouter": 1, "posts": 1, "root": 1, "user": 1 },
    { "auth": 1, "myRouter": 2, "posts": 1, "root": 1, "user": 1 },
    { "auth": 1, "myRouter": 3, "posts": 1, "root": 1, "user": 2 },
    { "auth": 1, "myRouter": 4, "posts": 1, "root": 1, "user": 2 },
    { "auth": 1, "myRouter": 5, "posts": 1, "root": 1, "user": 3 },
  ]);

  assert.equal(frameUpdates.length, 0);
});

test('scoped services are passed useful contextual info for loading data', function (assert) {
  let { scopeTree, frameUpdates, navStack } = buildWorld(map);

  navStack.didUpdateStateString(JSON.stringify([ { url: "users/machty/posts" } ]));

  let f = frameUpdates[0][0];
  let user = f.outletState.scope.registry.user;
  assert.deepEqual(user.scopeData, { key: 'k_user_id=machty', params: { user_id: 'machty' } });
});

test('populates a data pool', function (assert) {
  let { navStack } = buildWorld(map);
  navStack.didUpdateStateString(JSON.stringify([ { url: "welcome" }, ]));
  let nodes = navStack.dataPool.nodes;
  assert.equal(nodes.length, 2);
  let root = nodes[0];
  assert.equal(root.key, 'root_');
  assert.deepEqual(root.deps, []);
  let welcome = nodes[1];
  assert.equal(welcome.key, 'welcome_');
  assert.deepEqual(welcome.deps, []);
});

test('auto-specifies constraints as a data dependency for children', function (assert) {
  let { navStack, frameUpdates } = buildWorld(map);
  navStack.didUpdateStateString(JSON.stringify([ { url: "admin/dashboard" }, ]));
  let nodes = navStack.dataPool.nodes;
  assert.deepEqual(nodes.map(n => n.key), [ "root_", "auth_adminUser", "admin_", "dashboard_" ]);
  assert.deepEqual(nodes.map(n => n.deps), [[], [], ["auth_adminUser"], ["auth_adminUser"]]);

  // let root = nodes[0];
  // assert.equal(root.key, 'root_');
  // assert.deepEqual(root.deps, []);
  // let admin = nodes[1];
  // assert.equal(admin.key, 'admin_');


  // // admin-user should have its own node i guess?
  // // but what should its data be?
  // // it should be like anything else, it just so happens to be mapped to auth.


  // assert.deepEqual(admin.deps, ['']);
  // let dashboard = nodes[2];
  // assert.equal(dashboard.key, 'dashboard_');
  // assert.deepEqual(dashboard.deps, []);


  // all of these should have nodes.


  // this.match(auth, 'admin-user', function() {
  //   this.route('admin', function() {
  //     this.route('dashboard');
  //   });
  // });
});

test('invalidation', function (assert) {
  let { scopeTree, frameUpdates, navStack } = buildWorld(map);

  navStack.didUpdateStateString(JSON.stringify([
    { url: "admin/dashboard" } 
  ]));

  assert.deepEqual(scopeTree(frameUpdates.pop()), [
    { "auth": 1, "myRouter": 1, "posts": 1, "root": 1, "user": 1 },
  ]);

  // a match statement is hmm, like any other thing?
  // it produces a value downstream?
  // we can just model this stuff with sets and other shit.

  // TODO: figure out the loading/validation mechanism for the first `when` load
  // TODO: consider the idea of moving .match logic into routes?
  //       e.g. won't routes still want a way to do live validation? It would 
  //       suck if they had to move all that out and add a shitton of nesting
  //       to the router map.

  class AsyncValue {
    state : 'fun' | 'wat' | 'lol';

    constructor() {
      this.state = 'fun';
    }

    push() {

    }
  }

  // when you invalidate, we need to re-run the entire thing?
  // route model pushes update, and then we need to re-validate


  

  // let f = frameUpdates[0][0];
  // let user = f.outletState.scope.registry.user;
  // assert.deepEqual(user.scopeData, { key: 'k_user_id=machty', params: { user_id: 'machty' } });
});

function tagger() {
  let tag = 1;
  let tags = {};

  function scopeTreeSingle(frame) {
    let registry = frame.outletState.scope.registry;
    let result = {};
    Object.keys(registry).map(k => {
      let obj = registry[k];
      if (!obj.__tag) {
        if (!tags[k]) { tags[k] = 1; }
        obj.__tag = tags[k]++;
      }
      result[k] = obj.__tag;
    });
    return result;
  }

  function scopeTree(frames) {
    return frames.map(scopeTreeSingle);
  }

  return { scopeTree };
}

function buildWorld(map) {
  let registry = {};

  let owner = {
    factoryFor(name) {
      if (!registry[name]) {
        registry[name] = Ember.Object.extend({ name });
      }
      return { class: registry[name] };
    }
  };

  let { scopeTree } = tagger();

  let frameUpdates: any[] = [];

  let navStack = new NavStack(map, owner, {
    onNewFrames(frames) {
      frameUpdates.push(frames);
    }
  });

  return { owner, scopeTree, frameUpdates, navStack };
}
*/