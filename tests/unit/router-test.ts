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