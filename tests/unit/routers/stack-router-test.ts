import { test, module } from 'ember-qunit';
import { route, stackNavigator } from 'ember-constraint-router/map';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import { init } from 'ember-constraint-router/-private/navigation-actions';

module('Unit - StackRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("it provides an overridable componentName", function (assert) {
    let children = [ route('foo') ];
    let stackRouter1 = stackNavigator('root', children);
    let stackRouter2 = stackNavigator('root', children, { componentName: "x-foo" });
    assert.equal(stackRouter1.componentName, "ecr-stack");
    assert.equal(stackRouter2.componentName, "x-foo");
  });

  test("it provides a default state", function (assert) {
    let children = [ route('foo') ];
    let stackRouter = stackNavigator('root', children);
    let state = stackRouter.getStateForAction(init(), null)
    assert.deepEqual(state, {
      "componentName": "ecr-stack",
      "isTransitioning": false,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "index": 0,
      "routes": [
        {
          "key": "id-0",
          "params": {},
          "routeName": "foo",
          "componentName": "foo",
        }
      ]
    });
  });

  test("it supports nesting", function (assert) {
    let stackRouter = stackNavigator('root', [
      stackNavigator('nested', [
        route('foo')
      ]),
    ]);
    let state = stackRouter.getStateForAction(init(), null)
    assert.deepEqual(state, {
      "componentName": "ecr-stack",
      "index": 0,
      "isTransitioning": false,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "key": "id-0",
          "params": {},
          "routeName": "nested",
          "componentName": "nested",
        }
      ]
    });
  });
});
