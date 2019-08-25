import { test, module } from 'ember-qunit';
import { route, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import * as NavigationActions from 'ember-constraint-router/-private/navigation-actions';
import * as StackActions from 'ember-constraint-router/-private/stack-actions';
import { StackRouter } from 'ember-constraint-router/-private/routers/stack-router';
import { Action } from 'ember-constraint-router/-private/action';
import { RouterState } from 'ember-constraint-router/-private/routeable';

module('Unit - StackRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("it provides an overridable componentName", function (assert) {
    let children = [ route('foo') ];
    let stackRouter1 = stackRouter('root', children);
    let stackRouter2 = stackRouter('root', children, { componentName: "x-foo" });
    assert.equal(stackRouter1.componentName, "ecr-stack");
    assert.equal(stackRouter2.componentName, "x-foo");
  });

  const DEFAULT_STATE = {
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
  }

  test("it provides a default state", function (assert) {
    let children = [ route('foo') ];
    let router = stackRouter('root', children);
    let state = router.getInitialState(NavigationActions.init());
    assert.deepEqual(state, DEFAULT_STATE);
  });

  test("it supports nesting", function (assert) {
    let router = stackRouter('root', [
      stackRouter('nested', [
        route('foo')
      ]),
    ]);
    let initialState= router.getInitialState(NavigationActions.init());
    assert.deepEqual(initialState, {
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

    let state2 = handle(router, NavigationActions.navigate({ routeName: 'foo', key: 'other' }), initialState);

    assert.deepEqual((state2.routes[0] as RouterState).routes, [
      {
        "componentName": "foo",
        "key": "id-0",
        "params": {},
        "routeName": "foo"
      },
      {
        "componentName": "foo",
        "key": "other",
        "params": undefined,
        "routeName": "foo"
      },
    ]);
  });

  test("it supports navigation", function (assert) {
    let router = stackRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let initialState = router.getInitialState(NavigationActions.init());
    let state = handle(router, NavigationActions.navigate({ routeName: 'bar' }), initialState);
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
    let state2 = handle(router, NavigationActions.navigate({ routeName: 'bar' }), state);
    assert.equal(state, state2);

    // providing a key causes a push
    let state3 = handle(router, NavigationActions.navigate({ routeName: 'bar', key: "lol" }), state2);
    assert.equal(state3.index, 2);
  });

  test("it supports popping the stack", function (assert) {
    let children = [ route('foo'), route('bar') ];
    let router = stackRouter('root', children);
    let initialState = router.getInitialState(NavigationActions.init());
    assert.deepEqual(initialState, DEFAULT_STATE);
    let state2 = handle(router, NavigationActions.navigate({ routeName: 'bar' }), initialState);
    let state3 = handle(router, StackActions.pop(), state2);
  });
});

function handle(stackRouter: StackRouter, action: Action, state: RouterState) : RouterState {
  let result = stackRouter.dispatch(action, state);

  if (!result.handled) {
    throw new Error("expected handled action");
  }

  return result.state;
}
