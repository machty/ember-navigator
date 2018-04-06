import { test, module } from 'ember-qunit';
import { route, state, when, createMap } from 'ember-constraint-router/-dsl';
import { StateTree, Node } from 'ember-constraint-router/-vtree';

module('Unit - Router test', {
  beforeEach: function () {
  },
  afterEach: function () {
  },
});

test('basic map', function (assert) {
  const map = createMap(() => [ route('foo') ]);
  let result = map.recognize('foo');
  assert.deepEqual(mapResult(result), ['foo_.0']);
});

function mapResult(result) {
  return (result || []).map((obj) => `${obj.handler.name}_${obj.handler.key}`)
}