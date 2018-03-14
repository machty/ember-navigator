// tests/unit/routes/index-test.js
import { test, module, skip } from 'ember-qunit';
import Ember from 'ember';
const { VNode, diff, patch } = window.virtualDom;

class Node {
  buildChildren() {
    return {};
  }
}

// a node that expects handlerInfo args
class RouteNode extends Node {
  buildChildren(props, state) {
    let { index, infos } = props;
    let childIndex = index + 1;
    let childInfo = infos[childIndex];
    if (childInfo) {
      return {
        child: new VNode(childIndex.nodeClass, {
          infos,
          index: childIndex
        })
      };
    }
  }
}

function buildTree(rootNodeClass, props) {
  return {
    nodeClass: rootNodeClass,
    props
  };
}






module("Unit - McRIB", {
  beforeEach: function () {},
  afterEach: function () {}
});

test("buildTree uses the router map to build a vtree", function(assert) {
  // canonical tree.


  return {
    main: [
      RootNode,
      {
      }
    ]
  };

  // this is setState but returns a promise.
  this.transitionTo({
    foo: 123
  });

  this.transitionTo({
    user: machty
  });






  class ChildNode extends RouteNode { }

  class RootNode extends RouteNode {

    // buildChildren() {
    //   return {
    //     child: new VNode(ChildNode, {
    //       foo: 123
    //     })
    //   };
    // }


    buildChildren() {
    }
  }

  // diff;

  let a = new VNode('div', {
    className: "greeting"
  });

  let b = new VNode('div', {
    className: "greeting"
  });

  let c = new VNode('div', {
    className: "greetingOther"
  }, [
    new VNode(ChildNode, {
      className: "greetingOtherInner"
    })
  ]);

  let d = new VNode(ChildNode, {
    className: "greetingOther"
  });

  let e = new VNode(RootNode, {
    className: "greetingOther"
  });

  // classname values can be objects with .hook() and .unhook()


  let patches = diff(a, c);

  let renderOptions = {
    // patch(rootNode, patches, renderOptions) {
    //   debugger;
    // },
    render(vnode, opts) {
      var warn = opts ? opts.warn : null

      vnode = handleThunk(vnode).a

      if (isWidget(vnode)) {
        return vnode.init()
      } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
      } else if (!isVNode(vnode)) {
        if (warn) {
          warn("Item is not a valid virtual dom node", vnode)
        }
        return null
      }

      var node = (vnode.namespace === null) ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName)

      var props = vnode.properties
      applyProperties(node, props)

      var children = vnode.children

      for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
          node.appendChild(childNode)
        }
      }

      return node
    }
  };

  let rootNode = {
    childNodes: []
  };

  debugger;
  let result = patch(rootNode, patches, renderOptions);


    // debugger;



  let vTree = buildTree(RootNode, {
    index: 0,
    infos: [
      { handler: RootNode },
      { handler: ChildNode }
    ]
  });

  assert.equal(vTree.nodeClass, RootNode);
  assert.equal(vTree.props.abc, 123);
  assert.equal(vTree.children.child, 123);


  // let graph = diffGraph(emptyGraph, vTree);

  // diffGraph makes changes to things.


  // what is the difference between this.transitionTo() and setState()
  // the state can be handlers. URL can be part of it too, maybe?

  // this.setState({
  //   infos: [{ handler: RootNode }, { handler: ShitHead }],
  //   index: 0
  // });
});


/*
test("Nodes can be used to reconstruct graphs", function(assert) {
  class Child extends Node {
    build() {
      return [];
    }
  }

  class Parent extends Node {
    buildChild(b) {
      return [Child, { foo: 123 }];
    }

    build() {
      return {
        main: [
          Borf,
          { foo: 123 },
        ]
      };
    }
  }

  let graph = buildTree(Parent, {});
});
*/

