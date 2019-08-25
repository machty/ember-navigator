import { test, module } from 'ember-qunit';
import { route, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import { RouterState } from 'ember-constraint-router/-private/routeable';
import { handle, navigate } from './helpers';
import { pop } from 'ember-constraint-router/-private/actions/actions';

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
        "params": null,
        "routeName": "foo",
        "componentName": "foo",
      }
    ]
  }

  test("it provides a default state", function (assert) {
    let children = [ route('foo') ];
    let router = stackRouter('root', children);
    let state = router.getInitialState();
    assert.deepEqual(state, DEFAULT_STATE);
  });

  test("it supports nesting", function (assert) {
    let router = stackRouter('root', [
      stackRouter('nested', [
        route('foo')
      ]),
    ]);

    let initialState= router.getInitialState();
    assert.deepEqual(initialState, {
      "componentName": "ecr-stack",
      "index": 0,
      "isTransitioning": false,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "componentName": "ecr-stack",
          "index": 0,
          "isTransitioning": false,
          "key": "StackRouterRoot",
          "params": {},
          "routeName": "nested",
          "routes": [
            {
              "componentName": "foo",
              "key": "id-0",
              "params": null,
              "routeName": "foo"
            }
          ]
        }
      ]
    })

    // let state2 = handle(router, NavigationActions.navigate({ routeName: 'foo', key: 'other' }), initialState);
    let state2 = navigate(router, initialState, { routeName: 'foo', key: 'other' });
    assert.deepEqual((state2.routes[0] as RouterState).routes, [
      {
        "componentName": "foo",
        "key": "id-0",
        "params": null,
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

  test("it supports navigating to deeply nested inactive routes", function (assert) {
    let router = stackRouter('root', [
      route('a'),
      stackRouter('deeply', [
        stackRouter('nested', [
          route('b'),
        ]),
      ]),
    ]);
    let initialState = router.getInitialState();
    let state = navigate(router, initialState, 'b');
    assert.deepEqual((state.routes[1] as RouterState).routes, [
      {
        "componentName": "ecr-stack",
        "index": 0,
        "isTransitioning": false,
        "key": "StackRouterRoot",
        "params": {},
        "routeName": "nested",
        "routes": [
          {
            "componentName": "b",
            "key": "id-2",
            "params": undefined,
            "routeName": "b"
          }
        ]
      }
    ]);
  });

  test("it supports navigation", function (assert) {
    let router = stackRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let initialState = router.getInitialState();
    let state = navigate(router, initialState, { routeName: 'bar' });
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
          "params": undefined,
          "routeName": "foo"
        },
        {
          "key": "id-2",
          "params": undefined,
          "routeName": "bar",

          "componentName": "bar",
        }
      ]
    });

    // key-less navigation to a route that's already on the stack is a no-op
    let state2 = navigate(router, state, { routeName: 'bar' });
    assert.equal(state, state2);

    // providing a key causes a push
    // let state3 = handle(router, NavigationActions.navigate({ routeName: 'bar', key: "lol" }), state2);
    let state3 = navigate(router, state2, { routeName: 'bar', key: "lol" });
    assert.equal(state3.index, 2);
  });

  test("it supports popping the stack", function (assert) {
    let children = [ route('foo'), route('bar') ];
    let router = stackRouter('root', children);
    let initialState = router.getInitialState();
    assert.deepEqual(initialState, DEFAULT_STATE);
    let state2 = navigate(router, initialState, { routeName: 'bar' });

    let state3 = handle(router, pop(), state2);
    assert.deepEqual(state3.routes, DEFAULT_STATE.routes);
  });
});
