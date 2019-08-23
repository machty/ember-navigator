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

test('loading from url', function (assert) {
  let { navStack, registry, routes } = buildWorld(map);
  navStack.didUpdateStateString(JSON.stringify([ { url: 'normal' } ]));
  compareArray(assert, routes, [{ name: "route:normal" }])
});

module('Unit - NavStack.navigate()');

test('basics', function (assert) {
  let { navStack, routes } = buildWorld(map);
  navStack.navigate("normal");
  navStack.navigate("normal");
  compareArray(assert, routes, [{ name: "route:normal" }])
});

function buildWorld(map) {
  let registry = {};
  let routes: any[] = [];

  let owner = {
    factoryFor(name) {
      if (!registry[name]) {
        registry[name] = Ember.Object.extend({
          init(...args) {
            this._super(...args);
            routes.push(this);
          },
          name
        });
      }
      return { class: registry[name] };
    }
  };

  let navStack = new NavStack(routerMap, owner);

  return { owner, navStack, registry, routes };
}

function compareArray(assert, actual, expected) {
  let len = Math.max(actual.length, expected.length); 
  let keys;
  for (let i = 0; i < len; ++i) {
    let a = actual[i] || {};
    let b = expected[i] || {};
    keys = keys || Object.keys(b);
    keys.forEach(k => assert.deepEqual(a[k], b[k]));
  }
}
