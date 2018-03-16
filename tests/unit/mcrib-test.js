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
  constructor(props, name) {
    super(props);
    this.name = name;
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

test('basic buildup and teardown', function(assert) {
  class ChildNode extends TestNode {
    constructor(props) {
      super(props, 'ChildNode');
    }
  }

  class RootNode extends TestNode {
    constructor(props) {
      super(props, 'RootNode');
    }

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

  let tree = new StateTree(RootNode, {});
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

  class FooNode extends TestNode {
    constructor(props) {
      super(props, 'FooNode');
    }
  }

  class BarNode extends TestNode {
    constructor(props) {
      super(props, 'BarNode');
    }
  }

  class RootNode extends TestNode {
    constructor(props) {
      super(props, 'RootNode');
    }

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
