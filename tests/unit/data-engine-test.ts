import { test, module } from 'ember-qunit';
import { setupTest } from 'ember-qunit';
import { DataScope } from 'ember-constraint-router/-private/data-engine/data-scope';
import { DataNode, SimpleDataNode } from 'ember-constraint-router/-private/data-engine/data-node';
import { run } from '@ember/runloop';

import { guidFor } from '@ember/object/internals';
import Ember from 'ember';

module('Unit - Data Engine test', function(hooks) {
  setupTest(hooks);

  test('SimpleDataNodes emit values immediately', function(assert) {
    let dataScope = new DataScope();
    let fooNode = new SimpleDataNode('foo', 'fookey', 'fooValue');
    let barNode = new SimpleDataNode('bar', 'barkey', 'barValue');

    let listenValues: any[] = [];
    let listener = (...args) => listenValues.push(args);

    fooNode.listen(null, listener);
    barNode.listen(null, listener);

    dataScope.register('foo', fooNode);
    dataScope.register('bar', barNode);

    assert.deepEqual(listenValues, []);
    run(() => dataScope.start())
    assert.equal(listenValues.length, 2);

    let [dataNode, dataName, value] = listenValues[0];
    assert.equal(dataNode, fooNode);
    assert.equal(dataName, 'foo');
    assert.equal(value, 'fooValue');

    [dataNode, dataName, value] = listenValues[1];
    assert.equal(dataNode, barNode);
    assert.equal(dataName, 'bar');
    assert.equal(value, 'barValue');
  });
});