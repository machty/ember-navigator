import { test, module } from 'ember-qunit';

import Solver from 'ember-constraint-router/solver';
import EqualityConstraint from 'ember-constraint-router/constraints/equality';
import Literal from 'ember-constraint-router/literal';
import Reference from 'ember-constraint-router/reference';

module("Unit - Solver");

test("it exists", function(assert) {
  let solver = new Solver();
  assert.ok(solver);
});

test("it validates against constraints", function(assert){
  let solver = new Solver();

  assert.ok(solver.validate({}).isValid());

  solver.addConstraint(
    new EqualityConstraint([
      new Reference(['foo']),
      new Literal(5)
    ])
  );

  assert.ok(!solver.validate({foo: 4}).isValid());
  assert.ok(solver.validate({foo: 5}).isValid());
});

