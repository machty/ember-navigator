import { test, module } from 'ember-qunit';
import Reference from 'ember-constraint-router/reference';

module("Unit - Reference");

function getValue(obj, path) {
  let ref = new Reference(path);
  return ref.value(obj);
}

test("empty path returns the root object", function(assert) {
  let obj = {};
  assert.equal(getValue(obj, []), obj);
});

test("finds shallow values", function(assert) {
  assert.equal(getValue({ foo: 123 }, ['foo']), 123);
});

test("finds deep values", function(assert) {
  assert.equal(getValue({ foo: { bar: 123 } }, ['foo', 'bar']), 123);
});

test("returns undefined when it can't find a value", function(assert) {
  // TODO: should we distinguish undefined as a value and
  // undefined for when the path was prematurely cut short?
  // There might be an issue of constraints unintentionally matching
  // an empty undefined with an undefined due to a bad path.
  assert.equal(getValue({}, ['foo', 'bar']), undefined);
});
