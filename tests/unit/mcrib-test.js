// tests/unit/routes/index-test.js
import {test, module, skip} from 'ember-qunit';
import Ember from 'ember';

import { StateTree, Node } from 'ember-constraint-router/-vtree';

module('Unit - McRIB', {
  beforeEach: function() {},
  afterEach: function() {},
});

test('buildTree uses the router map to build a vtree', function(assert) {
  let hooks = [];

  class ChildNode extends Node {
    constructor(props) {
      super(props);
      hooks.push('ChildNode()');
    }

    willDestroy() {
      hooks.push('ChildNode.willDestroy()');
    }
  }

  class RootNode extends Node {
    constructor(props) {
      super(props);
      hooks.push('RootNode()');
    }

    buildChildren() {
      hooks.push('RootNode.buildChildren()');
      return {
        main: {
          nodeClass: ChildNode,
          props: {
            foo: 123,
          },
        },
      };
    }

    willDestroy() {
      hooks.push('RootNode.willDestroy()');
    }
  }

  let tree = new StateTree(RootNode, {});

  assert.deepEqual(hooks, [
    'RootNode()',
    'RootNode.buildChildren()',
    'ChildNode()',
  ]);

  hooks = [];

  tree.dispose();

  assert.deepEqual(hooks, ['wat']);
});
