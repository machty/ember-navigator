import { test, module } from 'ember-qunit';
import MicroRouter from 'ember-constraint-router/-micro-router';
// import Ember from 'ember';

module('Unit - Router test');

test('it microroutes', function (assert) {
  assert.expect(1);

  let mr = new MicroRouter();

  // microrouter emits states. i guess.
  // or it's a reference? TODO: glimmer-ify
  // i guess i re-validate the whole tree every time?
  // See what changed?
  // mr.subscribe((ev) => {
  // });
});