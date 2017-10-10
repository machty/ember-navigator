import { test, module } from 'ember-qunit';
import EqualityConstraint from 'ember-constraint-router/constraints/equality';
import ValidationResult from 'ember-constraint-router/validation-result';
import Literal from 'ember-constraint-router/literal';

module("Unit - Equality Constraint");

function doesValidate(operands) {
  let result = new ValidationResult();
  let constraint = new EqualityConstraint(operands);
  constraint.validate({}, result);
  return result.isValid();
}

test("it always validates zero operands", function(assert) {
  assert.ok(doesValidate([]));
});

test("it always validates one operand", function(assert) {
  assert.ok(doesValidate(['stub']));
});

test("it validates when values are equal", function(assert) {
  assert.ok(doesValidate([new Literal(5), new Literal(5)]));
});

test("it fails when values are not equal", function(assert) {
  assert.ok(!doesValidate([new Literal(5), new Literal(6)]));
});
