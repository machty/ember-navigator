import { test, module } from 'ember-qunit';
import { NavStack } from 'ember-constraint-router/-nav-stack';
import { createMap } from 'ember-constraint-router/-dsl';
import { guidFor } from '@ember/object/internals';
import Ember from 'ember';

module('Unit - NavStack test');

const Factory = Ember.Object.extend();

const map = createMap(function() {
  this.route('welcome');
  this.state('auth');
  this.route('user', { path: 'users/:user_id' }, function() {
    this.route('posts');
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
