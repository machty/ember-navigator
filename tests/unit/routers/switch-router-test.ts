import { test, module } from 'ember-qunit';
import { route, switchRouter, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import { navigate } from './helpers';

module('Unit - SwitchRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("initial state", function (assert) {
    let router = switchRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let state = router.getInitialState();
    assert.deepEqual(state, {
      "componentName": "ecr-switch",
      "index": 0,
      "isTransitioning": false,
      "key": "SwitchRouterBase",
      "params": undefined,
      "routeName": "root",
      "routes": [
        {
          "componentName": "foo",
          "key": "id-0",
          "params": undefined,
          "routeName": "foo" ,
        },
        {
          "componentName": "bar",
          "key": "id-1",
          "params": undefined,
          "routeName": "bar",
        }
      ]
    });
  });

  test("navigating between routes causes old routes to be reset", function() {
    let router = buildExampleRouter();
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, 'b1');
    debugger;
  })
});

function buildExampleRouter() {
  return switchRouter('root', [
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
  ]);
}
