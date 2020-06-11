import { test, module } from 'ember-qunit';
import { route, tabRouter, stackRouter } from 'ember-navigator';
import { _TESTING_ONLY_normalize_keys } from 'ember-navigator/-private/key-generator';
import { navigate } from './helpers';
import { RouterState, StackRouterState } from 'ember-navigator/-private/routeable';

module('Unit - TabRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("initial state", function (assert) {
    let router = tabRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let state = router.getInitialState();
    assert.deepEqual(state, {
      "componentName": "ecr-switch",
      "index": 0,
      "key": "TabRouterBase",
      "params": undefined,
      "routeName": "root",
      "routes": [
        {
          "componentName": "foo",
          "key": "foo",
          "params": undefined,
          "routeName": "foo" ,
        },
        {
          "componentName": "bar",
          "key": "bar",
          "params": undefined,
          "routeName": "bar",
        }
      ]
    });
  });

  test("navigating between shallow routes", function(assert) {
    let router = buildExampleRouter();
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'b1');
    assert.equal(state2.index, 1);
    assert.deepEqual(state2.routes[1], {
      "componentName": "ecr-stack",
      "headerComponentName": "ecr-header",
      "headerMode": "float",
      "index": 0,
      "key": "b",
      "params": {},
      "routeName": "b",
      "routes": [
        {
          "componentName": "b1",
          "key": "b1",
          "params": null,
          "routeName": "b1"
        }
      ]
    } as RouterState);
    let state3 = navigate(router, initialState, 'b2');
    let innerRoute = state3.routes[1] as RouterState;
    assert.equal(innerRoute.index, 1);
    assert.deepEqual(innerRoute.routes.map(r => r.routeName), ["b1", "b2"]);
  });

  test("navigating to the parent route if a route you're in should be a no-op", function(assert) {
    let router = tabRouter('a', [
      stackRouter('b', [
        route('c'),
      ])
    ]);

    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'b');
    assert.equal(initialState, state2);
  });

  test("navigating away", function(assert) {
    let router = tabRouter('root', [
      route('a'),
      route('b'),
    ]);

    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'b');
    assert.equal(state2.index, 1);
    let state3 = navigate(router, state2, 'a');
    assert.equal(state3.index, 0);
  });

  test("no-op navigation within active route results in same state object being returned", function(assert) {
    let router = buildExampleRouter();
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'a1');
    assert.equal(initialState, state2);
  });

  test("navigation within active route", function(assert) {
    let router = buildExampleRouter();
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'a2');
    assert.notEqual(state2, initialState);
    assert.equal(state2.index, 0);
    let newNestedRoute = (state2.routes[0] as RouterState);
    assert.equal(newNestedRoute.index, 1);
  });

  test("navigation to another tab route preserves the state of each tab", function(assert) {
    let router = buildExampleRouter();
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'a2');
    let state3 = navigate(router, state2, 'b');
    let state4 = navigate(router, state3, 'a');
    assert.equal(state4.index, 0, 'first tab should be active');
    let tabRouterState = state4.routes[0] as any;
    assert.equal(tabRouterState.index, 1,  'first tab should still be drilled down one level');
    assert.equal(tabRouterState.routes.length, 2, 'first tab should still be drilled down one level');
    assert.equal(tabRouterState.routes[1].routeName, 'a2', 'first tab should still have a2 active');
  });
});

function buildExampleRouter() {
  return tabRouter('root', [
    stackRouter('a', [
      route('a1'),
      route('a2'),
    ]),
    stackRouter('b', [
      route('b1'),
      route('b2'),
    ]),
    stackRouter('c', [
      route('c1'),
      route('c2'),
    ]),
    route('shallow'),
  ]);
}
