export class Node {
  constructor(props) {
    this.props = props;
  }

  buildChildren() {
    return {};
  }
}

// a node that expects handlerInfo args
export class RouteNode extends Node {
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
  };

  Object.keys(oldObj)
    .sort()
    .forEach(k => {
      let newFactory = newObject[k];
      if (newFactory) {
        let instance = oldObj[k].instance;

        // TODO: check key here; key defaults to Class
        // actually key=Class is probably not good. probably
        // needs to be a name string, or something from the handler info?
        // in fact, yeah, RouteNodes should use a key of info.name i think, maybe?

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

export class StateTree {
  constructor(rootNodeClass, rootProps) {
    this.rootNodeClass = rootNodeClass;
    this.rootProps = rootProps;
    this.buildTree();
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

