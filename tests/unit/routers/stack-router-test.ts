import { test, module } from 'ember-qunit';
import { route, stackNavigator } from 'ember-constraint-router/map';

module('Unit - StackRouter test');

test("it provides an overridable componentName", function (assert) {
  let children = [ route('foo') ];
  let stackRouter1 = stackNavigator('root', children);
  let stackRouter2 = stackNavigator('root', children, { componentName: "x-foo" });
  assert.equal(stackRouter1.componentName, "ecr-stack");
  assert.equal(stackRouter2.componentName, "x-foo");
});
