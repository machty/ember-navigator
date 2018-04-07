import { test, module } from 'ember-qunit';
import { route, state, when, createMap } from 'ember-constraint-router/-dsl';

module('Unit - Router test', {
  beforeEach: function () {
  },
  afterEach: function () {
  },
});

test('.mount can mount to ember dsl', function (assert) {
  assert.expect(2);
  const map = createMap(() => [ route('foo') ]);

  let emberRouterMap = {
    route(name, options) {
      assert.equal(name, 'foo');
      assert.deepEqual(options, { resetNamespace: true });
    }
  };

  map.mount(emberRouterMap);
});

test('it maintains a registry of child names', function (assert) {
  assert.expect(2);
  const map = createMap(() => [
    route('foo'),
    route('parent', () => [
      route('child'),
    ]),
  ]);

  let scope = map.getScope('parent')!.getScope('child')!;
  assert.equal(scope.name, 'child');

  let scope2 = map.getScope('child');
  assert.equal(scope2, scope);
});

test('allows state constraints', function (assert) {
  assert.expect(1);
  const map = createMap(() => [
    state('user-session', (us) => [
      when('absent', () => [
        route('get-user-session')
      ]),
      when('present', () => [
        route('logged-in')
      ]),
    ])
  ]);

  let dslCalls: any[] = [];

  let emberRouterMap = {
    route(name, options, desc) {
      dslCalls.push(['route', name, options]);
      desc.call(emberRouterMap);
    },
    state(name, options, desc) {
      dslCalls.push(['state', name, options]);
      desc.call(emberRouterMap);
    }
  };

  map.mount(emberRouterMap);

  assert.deepEqual(dslCalls, [
    [ "route", "root-state-0", { "path": "/", "resetNamespace": true } ],
    [ "route", "user-session-when-0", { "path": "/", "resetNamespace": true } ],
    [ "route", "get-user-session", { "resetNamespace": true } ],
    [ "route", "user-session-when-1", { "path": "/", "resetNamespace": true } ],
    [ "route", "logged-in", { "resetNamespace": true } ]
  ]);
});