export class Node {
  constructor(props) {
    this.props = props;
  }

  buildChildren() {
    return {};
  }

  willDestroy() {}

  destroy() {
    this.willDestroy();
  }
}

// a node that expects handlerInfo args
export class RouteNode extends Node {
  buildChildren(props) {
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
  };

  Object.keys(oldObj)
    .sort()
    .forEach(k => {
      let newFactory = newObj[k];
      if (newFactory) {
        let instance = oldObj[k].instance;

        // TODO: check key here; key defaults to Class
        // actually key=Class is probably not good. probably
        // needs to be a name string, or something from the handler info?
        // in fact, yeah, RouteNodes should use a key of info.name i think, maybe?

        if (instance.constructor === newFactory.nodeClass) {
          result.preserved.push(k);
        } else {
          result.removed.push(k);
          result.added.push(k);
        }
      } else {
        result.removed.push(k);
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

export class StateTree {
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

function diffPatch(oldSet, newChildren) {
  let newObject = {};

  let divvy = divvyOldNew(oldSet, newChildren);

  divvy.removed.forEach(k => {
    detachTree(oldSet[k]);
    oldSet = null;
  });

  divvy.preserved.forEach(k => {
    let p = oldSet[k];
    let q = newChildren[k];
    let instance = p.instance;

    // 1. Update props
    instance.props = q.props;

    // 2. Render with new props
    let childrenVTree = instance.buildChildren(instance.props);

    // 3. Store the instance
    newObject[k] = {
      instance,
      children: diffPatch(p.children, childrenVTree),
    };
  });

  divvy.added.forEach(k => {
    let newObj = newChildren[k];
    let instance = new newObj.nodeClass(newObj.props);
    let childrenVTree = instance.buildChildren(instance.props);

    newObject[k] = {
      instance,
      children: diffPatch({}, childrenVTree),
    };
  });

  return newObject;
}
