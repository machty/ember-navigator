// tests/unit/routes/index-test.js
import { test, module } from 'ember-qunit';

import ParamsSource from 'ember-constraint-router/params-source';

module("Unit - Constraint", {
  // only necessary if you want to load other items into the runtime
  // needs: ['controller:index']
  beforeEach: function () {},
  afterEach: function () {}
});

test("it exists", function(assert){
  let source = new ParamsSource();
  assert.equal(source.isMutable, false);
});

