import { test, module } from 'ember-qunit';
import { route, switchRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import * as NavigationActions from 'ember-constraint-router/-private/navigation-actions';
import * as StackActions from 'ember-constraint-router/-private/stack-actions';
import { StackRouter } from 'ember-constraint-router/-private/routers/stack-router';
import { Action } from 'ember-constraint-router/-private/action';
import { RouterState } from 'ember-constraint-router/-private/routeable';

module('Unit - SwitchRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("initial state", function (assert) {
    let router = switchRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let state = router.getInitialState(NavigationActions.init());
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
});

function handle(stackRouter: StackRouter, action: Action, state: RouterState) : RouterState {
  let result = stackRouter.dispatch(action, state);

  if (!result.handled) {
    throw new Error("expected handled action");
  }

  return result.state;
}
