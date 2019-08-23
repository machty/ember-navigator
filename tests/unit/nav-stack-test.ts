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
  let { navStack, registry, routes } = buildWorld(map);
  navStack.didUpdateStateString(JSON.stringify([ { url: 'normal' } ]));
  assert.equal(routes.length, 1);
  assert.equal(routes[0].name, "route:normal");
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