// tests/unit/routes/index-test.js
import {test, module, skip} from 'ember-qunit';
import Ember from 'ember';
const {VNode, diff, patch} = window.virtualDom;

class Node {
  constructor(props) {
    this.props = props;
  }

  buildChildren() {
    return {};
  }
}

// a node that expects handlerInfo args
class RouteNode extends Node {
  buildChildren(props, state) {
    let {index, infos} = props;
    let childIndex = index + 1;
    let childInfo = infos[childIndex];
    if (childInfo) {
      return {
        main: {
          nodeClass: childInfo.handler,
          props: {todo: 'this'},
        },
      };
    }
  }
}

function divvyOldNew(oldObj, newObj) {
  let result = {
    removed: [],
    added: [],
    preserved: [],
    // changed: [],
  };

  Object.keys(oldObj)
    .sort()
    .forEach(k => {
      let newFactory = newObject[k];
      if (newFactory) {
        let instance = oldObj[k].instance;

        // TODO: check key here; key defaults to Class

        if (instance.constructor === newFactory.nodeClass) {
          results.preserved.push(k);
        } else {
          // results.changed.push(k);
          results.removed.push(k);
          results.added.push(k);
        }
      } else {
        results.removed.push(k);
      }
    });

  Object.keys(newObj)
    .sort()
    .forEach(k => {
      if (!oldObj[k]) {
        result.added.push(k);
      }
    });

  return result;
}

class StateTree {
  constructor(rootNodeClass, rootProps) {
    this.rootNodeClass = rootNodeClass;
    this.rootProps = rootProps;
    // this.root = new rootNodeClass(rootProps);
    this.buildTree();
    // this.currentSet = {};
  }

  buildTree() {
    diffPatch(
      {},
      {
        root: {
          nodeClass: this.rootNodeClass,
          props: this.rootProps,
        },
      },
    );
  }

  render() {}

  dispose() {
    // tears down all the things, including root.
    // this should be accomplishable by patching with empty set.
  }
}

function detach(obj) {
  if (!obj) {
    return;
  }

  Object.keys(obj).forEach(k => {
    detach(obj[k]);
  });

  obj.dispose();
}

function diffPatch(oldSet, newChildren) {
  let divvy = divvyOldNew(oldSet, newChildren);

  divvy.removed.forEach(k => {
    oldSet[k].dispose();
    oldSet = null;
  });

  divvy.added.forEach(k => {
    let newObj = newChildren[k];
    let instance = new newObj.nodeClass(newObj.props);
    oldSet[k] = {
      instance,
    };

    let childrenFactories = instance.buildChildren();

    diffPatch({}, childrenFactories);
  });
}

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

  // assert.deepEqual(hooks, ['wat']);
});
