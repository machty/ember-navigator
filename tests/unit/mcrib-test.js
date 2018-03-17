// tests/unit/routes/index-test.js
import {test, module} from 'ember-qunit';
import {StateTree, Node} from 'ember-constraint-router/-vtree';

let hooks;

module('Unit - McRIB', {
  beforeEach: function() {
    hooks = [];
  },
  afterEach: function() {},
});

class TestNode extends Node {
  constructor(props) {
    super(props);
    this.name = this.constructor.name;
    hooks.push(`${this.name}()`);
  }

  buildChildren() {
    hooks.push(`${this.name}.buildChildren()`);
    return {};
  }

  willDestroy() {
    hooks.push(`${this.name}.willDestroy()`);
  }
}

test('building a single node', function(assert) {
  let tree = new StateTree();
  tree.update(Node, {});
  assert.ok(tree.root.root.instance.props);
  tree.destroy();
});

test('basic buildup and teardown', function(assert) {
  class ChildNode extends TestNode { }
  class RootNode extends TestNode {
    buildChildren() {
      super.buildChildren();
      return {
        main: {
          nodeClass: ChildNode,
          props: {},
        },
      };
    }
  }

  let tree = new StateTree();
  tree.update(RootNode, {});

  assert.deepEqual(hooks, [
    'RootNode()',
    'RootNode.buildChildren()',
    'ChildNode()',
    'ChildNode.buildChildren()',
  ]);

  hooks = [];

  tree.destroy();

  assert.deepEqual(hooks, [
    'ChildNode.willDestroy()',
    'RootNode.willDestroy()',
  ]);
});

test('changing children root.foo -> root.bar', function(assert) {
  let tree = new StateTree();

  class FooNode extends TestNode { }
  class BarNode extends TestNode { }
  class RootNode extends TestNode {
    buildChildren(props) {
      super.buildChildren();
      return {
        main: {
          nodeClass: props.showBar ? BarNode : FooNode,
          props: {},
        },
      };
    }
  }

  tree.update(RootNode, {showBar: false});
  tree.update(RootNode, {showBar: true});
  assert.deepEqual(hooks, [
    'RootNode()',
    'RootNode.buildChildren()',
    'FooNode()',
    'FooNode.buildChildren()',
    'RootNode.buildChildren()',
    'FooNode.willDestroy()',
    'BarNode()',
    'BarNode.buildChildren()',
  ]);

  hooks = [];

  tree.destroy();

  assert.deepEqual(hooks, ['BarNode.willDestroy()', 'RootNode.willDestroy()']);
});