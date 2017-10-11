import { test, module } from 'ember-qunit';
import AndConstraint from 'ember-constraint-router/constraints/and';
import ValidationResult from 'ember-constraint-router/validation-result';
import Reference from 'ember-constraint-router/reference';

module("Unit - And Constraint");

// This structure/setup guarantees that context obj
// is correctly passed around internally.
const TRUE = new Reference(['true']);
const FALSE = new Reference(['false']);

const OBJ = {
  true: true,
  false: false
};

function doesValidate(operands) {
  let result = new ValidationResult();
  let constraint = new AndConstraint(operands);
  constraint.validate(OBJ, result);
  return result.isValid();
}

test("does a boolean AND", function(assert) {
  assert.ok(doesValidate([TRUE, TRUE]));
  assert.ok(!doesValidate([TRUE, FALSE]));
  assert.ok(!doesValidate([FALSE, FALSE]));
  assert.ok(!doesValidate([FALSE, TRUE]));
});

