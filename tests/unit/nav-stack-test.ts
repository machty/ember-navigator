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
});

test('it shares states', function (assert) {
  let { scopeTree, frameUpdates, navStack } = buildWorld(map);

  navStack.didUpdateStateString(JSON.stringify([
    { url: "welcome" },
    { url: "welcome" },
  ]));

  assert.deepEqual(scopeTree(frameUpdates.pop()), [
    { auth: 1, myRouter: 2 },
    { auth: 1, myRouter: 3 }
  ]);

  assert.equal(frameUpdates.length, 0);
});

function tagger() {
  let tag = 1;

  function scopeTreeSingle(frame) {
    let registry = frame.outletState.scope.registry;
    let result = {};
    Object.keys(registry).map(k => {
      let obj = registry[k];
      if (!obj.__tag) {
        obj.__tag = tag++;
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
