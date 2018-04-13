import { test, module } from 'ember-qunit';
import { route, state, createMap, createMap2 } from 'ember-constraint-router/-dsl';
import Ember from 'ember';

module('Unit - Router test');

test('.mount can mount classic ember dsl', function (assert) {
  assert.expect(1);
  const map = createMap(function() {
    this.route('foo');
    this.route('bar', { path: 'other' });
  });

  debugger;

  let routes: any[] = [];
  let emberRouterMap = {
    route(name, options) {
      routes.push({ name, options })
    }
  };

  map.mount(emberRouterMap);
  assert.deepEqual(routes, [
    { "name": "foo", "options": { "resetNamespace": true } },
    { "name": "bar", "options": { "path": "other", "resetNamespace": true } },
  ]);
});

test('allows state constraints', function (assert) {
  assert.expect(1);
  const map = createMap(function() {
    let us = this.state('user-session');
    this.match(us, 'absent', function() {
      this.route('get-user-session')
    });

    this.match(us, 'present', function() {
      this.route('logged-in')
    });
  });

  let dslCalls: any[] = [];

  let emberRouterMap = {
    route(name, options, desc) {
      dslCalls.push(['route', name, options]);
      desc && desc.call(emberRouterMap);
    }
  };

  map.mount(emberRouterMap);
  assert.deepEqual(dslCalls, [
    [ "route", "get-user-session", { "resetNamespace": true } ],
    [ "route", "logged-in", { "resetNamespace": true } ]
  ]);
});