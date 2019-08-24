import { test, module } from 'ember-qunit';
import { route, stackNavigator } from 'ember-constraint-router/map';
import { Router } from 'ember-constraint-router/-private/router'

module('Unit - Router test');

test("it doesn't yet support non-unique route names", function (assert) {
  assert.raises(() => {
    new Router(
      stackNavigator('root', [
        route('foo'),
        stackNavigator('inner', [
          route('foo'),
        ]),
      ])
    );
  }, /Encountered duplicate route named foo/)
});
