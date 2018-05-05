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
    let simpleNode = new SimpleDataNode('foo', 'fookey', 'fooValue');

    let listenValues: any[] = [];
    simpleNode.listen(null, (...args) => {
      listenValues.push(args);
    });

    dataScope.register('foo', simpleNode);
    assert.deepEqual(listenValues, []);
    run(() => dataScope.start())
    assert.equal(listenValues.length, 1);
    let [dataNode, dataName, value] = listenValues[0];
    assert.equal(dataNode, simpleNode);
    assert.equal(dataName, 'foo');
    assert.equal(value, 'fooValue');
  });
});