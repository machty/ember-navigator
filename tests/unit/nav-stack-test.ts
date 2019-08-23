import { test, module } from 'ember-qunit';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack'
import Ember from 'ember';

import { map } from 'ember-constraint-router';

let routerMap = map(function() {
  this.route('normal');
  this.route('diff_path', { path: 'custom_path' });
  this.route('dynamic_route', { path: 'foo/:fun_id' });
});

module('Unit - NavStack test');

test('works', function (assert) {
  let { navStack } = buildWorld(map);

  debugger;

  // navStack.didUpdateStateString(JSON.stringify([
  //   { url: "welcome" },
  //   { url: "welcome" },
  // ]));

  // assert.deepEqual(scopeTree(frameUpdates.pop()), [
  //   { "auth": 1, "myRouter": 1, "root": 1, "welcome": 1 },
  //   { "auth": 1, "myRouter": 2, "root": 1, "welcome": 1 },
  // ]);

  // assert.equal(frameUpdates.length, 0);
});

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

  let frameUpdates: any[] = [];

  let navStack = new NavStack(map, owner);

  return { owner, navStack };
}