import { test, module } from 'ember-qunit';
import { route, stackRouter } from 'ember-navigator';
import { _TESTING_ONLY_normalize_keys } from 'ember-navigator/-private/key-generator';
import { RouterState } from 'ember-navigator/-private/routeable';
import { handle, navigate } from './helpers';
import { pop } from 'ember-navigator/-private/actions/actions';

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
        "key": "StackRouterRoot",
        "params": {},
        "routeName": "nested",
        "routes": [
          {
            "componentName": "b",
            "key": "id-2",
            "params": null,
            "routeName": "b"
          }
        ]
      } as RouterState
    ]);
  });

  test("it supports nesting", function (assert) {
    let router = stackRouter('root', [
      stackRouter('nested', [
        route('foo')
      ]),
    ]);

    let initialState = router.getInitialState();
    assert.deepEqual(initialState, {
      "componentName": "ecr-stack",
      "index": 0,
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "componentName": "ecr-stack",
          "index": 0,
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
        } as RouterState
      ]
    })

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
      "key": "StackRouterRoot",
      "params": {},
      "routeName": "root",
      "routes": [
        {
          "componentName": "foo",
          "key": "id-0",
          "params": null,
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
    let state3 = navigate(router, state2, { routeName: 'bar', key: "lol" });
    assert.equal(state3.index, 2);
    assert.equal(state3.routes[2].key, "lol");
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

  test("it supports navigating with params", function (assert) {
    let router = stackRouter('root', [ route('foo') ]);
    let state = router.getInitialState();
    let state2 = navigate(router, state,  { routeName: 'foo', key: "1", params: { id: 4 } });
    let state3 = navigate(router, state2, { routeName: 'foo', key: "2", params: { id: 5 }  });
    let state4 = navigate(router, state3, { routeName: 'foo', key: "3", params: { id: 6 }  });
    let allParams = state4.routes.map(r => ({ params: r.params }))
    assert.deepEqual(allParams, [
      { "params": null },
      { "params": { "id": 4 } },
      { "params": { "id": 5 } },
      { "params": { "id": 6 } }
    ]);
  });
});
