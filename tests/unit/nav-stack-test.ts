/*
import { test, module } from 'ember-qunit';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack'
import Ember from 'ember';
import { route, stackRouter } from 'ember-constraint-router';

let routerMap = stackRouter('root', [
  route('normal'),
  route('diff_path', { path: 'custom_path' }),
  route('dynamic_route', { path: 'foo/:fun_id' }),
]);

module('Unit - NavStack test');

test('loading from url', function (assert) {
  let { navStack, registry, routes } = buildWorld();
  navStack.didUpdateStateString(JSON.stringify([ { url: 'normal' } ]));
  compareArray(assert, routes, [{ name: "route:normal" }])
});

module('Unit - NavStack.navigate()');

test('navigate by default prevents double pushes', function (assert) {
  let { navStack, routes } = buildWorld();
  navStack.navigate("normal");
  navStack.navigate("normal");
  compareArray(assert, routes, [{ name: "route:normal" }])
});

test('navigate will double push if you provide a key', function (assert) {
  let { navStack, routes } = buildWorld();
  navStack.navigate("normal");
  navStack.navigate({ routeName: "normal", key: "foo" });
  navStack.navigate({ routeName: "normal", key: "foo" });
  navStack.navigate({ routeName: "normal", key: "lol" });
  compareArray(assert, routes, [{ name: "route:normal" }, { name: "route:normal" }, { name: "route:normal" }])
});

test('navigate will pop to the matching route', function (assert) {
  let { navStack, routes } = buildWorld();
  navStack.navigate("normal");
  navStack.navigate({ routeName: "normal", key: "foo" });
  navStack.navigate({ routeName: "normal", key: "lol" });
  navStack.navigate("normal");
  compareArray(assert, routes, [
    { name: "route:normal", isDestroying: false },
    { name: "route:normal", isDestroying: true },
    { name: "route:normal", isDestroying: true },
  ]);
  assert.equal(navStack.frames.length, 1);
});

function buildWorld() {
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
*/
