interface Props<T> {
}

interface Constructor<T> {
  // https://github.com/Microsoft/TypeScript/issues/2794#issuecomment-93713987
  new(...args: any[]): T;
}

class VNode<T> {
  nodeClass: Constructor<T>;
  props: Props<T>;

  constructor(nodeClass : Constructor<T>, props: Props<T>) {
    this.nodeClass = nodeClass;
    this.props = props;
  }
}

interface VTree {
  [key: string]: VNode<any>
}

interface DivvyResult {
  removed : string[];
  added: string[];
  preserved: string[];
}

// TODO: the point of this is so that people can just return null/undefined/nothing
// from buildChildren?
type BuildChildrenResult = VTree | undefined | null | void;

export class Node {
  props : any;

  constructor(props) {
    this.props = props;
  }

  buildChildren(props : any) : BuildChildrenResult {
  }

  b<T>(nodeClass : Constructor<T>, props : Props<T>) : VNode<T> {
    return new VNode(nodeClass, props);
  }

  willDestroy() {}

  destroy() {
    this.willDestroy();
  }
}

// a node that expects handlerInfo args
export class RouteNode extends Node {
  buildChildren(props : any) {
    let {index, infos} = props;
    let childIndex = index;
    let childInfo = infos[childIndex];
    if (childInfo) {
      return {
        main: this.b(RouteNode, { 
          index: index + 1,
          infos
        })
      };
    }
  }
}

function divvyOldNew(oldObj : DiffPatchResult, newObj) : DivvyResult {
  let removed: string[] = [];
  let added: string[] = [];
  let preserved: string[] = [];

  Object.keys(oldObj)
    .forEach(k => {
      let newFactory = newObj[k];
      if (newFactory) {
        let instance = oldObj[k].instance;

        if (instance.constructor === newFactory.nodeClass) {
          preserved.push(k);
        } else {
          removed.push(k);
          added.push(k);
        }
      } else {
        removed.push(k);
      }
    });

  Object.keys(newObj)
    .forEach(k => {
      if (!oldObj[k]) {
        added.push(k);
      }
    });

  return { removed, added, preserved };
}

class ConcreteNode {
  instance: Node;
  children: { [key: string]: ConcreteNode }

  constructor(instance, children) {
    this.instance = instance;
    this.children = children;
  }
}

export class StateTree {
  root : DiffPatchResult;

  constructor() {
    this.root = {};
  }

  update(nodeClass, props) {
    this.root = diffPatch(this.root, {
      root: {nodeClass, props},
    });
  }

  destroy() {
    this.root = diffPatch(this.root, {});
  }
}

function detachTree(tree) {
  Object.keys(tree.children).forEach(k => {
    detachTree(tree.children[k]);
  });
  tree.instance.destroy();
}

interface DiffPatchResult {
  [key: string]: ConcreteNode;
}

function diffPatch(oldSet, newChildren) : DiffPatchResult {
  let newObject : DiffPatchResult = {};

  let divvy = divvyOldNew(oldSet, newChildren);

  divvy.removed.forEach(k => {
    detachTree(oldSet[k]);
    oldSet = null;
  });

  // VNode has instance and VNode children

  divvy.preserved.forEach(k => {
    let p = oldSet[k];
    let q = newChildren[k];
    let instance = p.instance;

    // 1. Update props
    instance.props = q.props;

    // 2. Render with new props
    let childrenVTree = buildChildrenVTree(instance);

    // 3. Store the instance
    newObject[k] = new ConcreteNode(instance, diffPatch(p.children, childrenVTree));
  });

  divvy.added.forEach(k => {
    let newObj = newChildren[k];
    let instance = new newObj.nodeClass(newObj.props);
    let childrenVTree = buildChildrenVTree(instance);

    newObject[k] = new ConcreteNode(instance, diffPatch({}, childrenVTree));
  });

  return newObject;
}

function buildChildrenVTree(node : Node) : VTree {
  return node.buildChildren(node.props) || {};
}