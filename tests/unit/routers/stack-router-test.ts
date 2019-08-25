import { test, module } from 'ember-qunit';
import { route, stackNavigator } from 'ember-constraint-router/map';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import * as NavigationActions from 'ember-constraint-router/-private/navigation-actions';
import { StackRouter } from 'ember-constraint-router/-private/routers/stack-router';
import { Action } from 'ember-constraint-router/-private/action';
import { RouterState } from 'ember-constraint-router/-private/routeable';

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
    let state = stackRouter.getInitialState(NavigationActions.init());
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
    let state = stackRouter.getInitialState(NavigationActions.init());
    assert.deepEqual(state, {
      "componentName": "ecr-stack",
      "index": 0,
      "isTransitioning": false,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "componentName": "nested",
          "index": 0,
          "isTransitioning": false,
          "key": "id-1",
          "params": {},
          "routeName": "nested",
          "routes": [
            {
              "componentName": "foo",
              "key": "id-0",
              "params": {},
              "routeName": "foo"
            }
          ]
        }
      ]
    })
  });

  test("it supports navigation", function (assert) {
    let stackRouter = stackNavigator('root', [
      route('foo'),
      route('bar'),
    ]);
    let initialState = stackRouter.getInitialState(NavigationActions.init());
    let state = handle(stackRouter, NavigationActions.navigate({ routeName: 'bar' }), initialState);
    assert.deepEqual(state, {
      "componentName": "ecr-stack",
      "index": 1,
      "isTransitioning": true,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "componentName": "foo",
          "key": "id-0",
          "params": {},
          "routeName": "foo"
        },
        {
          "key": "id-1",
          "params": undefined,
          "routeName": "bar",

          "componentName": "bar",
        }
      ]
    });

    // key-less navigation to a route that's already on the stack is a no-op
    let state2 = handle(stackRouter, NavigationActions.navigate({ routeName: 'bar' }), state);
    assert.equal(state, state2);

    // providing a key causes a push
    let state3 = handle(stackRouter, NavigationActions.navigate({ routeName: 'bar', key: "lol" }), state2);
    assert.equal(state3.index, 2);
  });
});

function handle(stackRouter: StackRouter, action: Action, state: RouterState) : RouterState {
  let result = stackRouter.getStateForAction(action, state);

  if (!result.handled) {
    throw new Error("expected handled action");
  }

  return result.state;
}
