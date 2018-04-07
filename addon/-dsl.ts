import RouteRecognizer from 'ember-constraint-router/-route-recognizer';

interface MapChild {
  name: string;
  childrenDesc : MapChildrenFn;
  makeSegment: (key: string) => HandlerInfo;
}

interface RecognizerHandler {
  key: string;
  name: string;
}

interface RecognizerSegment {
  handler: RecognizerHandler;
  path: string;
}

interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

class RouteDescriptor implements MapChild {
  name: string;
  options: RouteDescriptorOptions;
  childrenDesc: MapChildrenFn;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    let path = this.options.path || this.name;
    return { path, handler: { key, name: this.name } };
  }
}

interface StateDescriptorOptions {
  key?: string;
}

class StateDescriptor implements MapChild {
  name: string;
  options: StateDescriptorOptions;
  childrenDesc: MapChildrenFn;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

class WhenDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenFn;

  constructor(childrenDesc) {
    this.name = 'when';
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

const nullChildrenFn = () => [];

type RouteDescriptorArgs = RouteDescriptorOptions | MapChildrenFn;
export function route(name: string, options: RouteDescriptorArgs = {}, childrenFn?: MapChildrenFn) : MapChild {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new RouteDescriptor(name, options, childrenFn);
}

type StateDescriptorArgs = StateDescriptorOptions | MapChildrenFn;
export function state(name: string, options: StateDescriptorArgs = {}, childrenFn?: MapChildrenFn) : MapChild {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new StateDescriptor(name, options, childrenFn);
}

export function when(conditionObj: any, childrenFn: MapChildrenFn) : MapChild {
  return new WhenDescriptor(childrenFn);
}

interface HandlerInfo {
  handler: any;
}

type MapChildrenFn = (...any) => MapChild[];

class MapScope {
  childScopes: MapScope[];
  desc: MapChild;
  parent?: MapScope;
  childScopeRegistry: {
    [key: string]: MapScope
  };

  constructor(desc: MapChild, parent?: MapScope) {
    this.desc = desc;
    this.childScopes = [];
    this.childScopeRegistry = {};
    this.parent = parent;
  }

  add(childrenDesc: MapChildrenFn) {
    let children = childrenDesc ? childrenDesc() : [];

    children.forEach((child, index) => {
      let childScope = new MapScope(child, this);
      childScope.add(child.childrenDesc);
      this._registerScope(childScope);
      this.childScopes.push(childScope);
    });
  }
  
  _registerScope(scope: MapScope) {
    if (scope.name === 'child') { debugger; }
    this.childScopeRegistry[scope.name] = scope;
    if (this.parent) {
      this.parent._registerScope(scope);
    }
  }

  getScope(name: string) : MapScope | undefined {
    return this.childScopeRegistry[name];
  }

  get name() : string {
    return this.desc.name;
  }
}

function makeRouterDslFn(childScopes : MapScope[]) {
  return function() {
    let emberRouterDsl = this;
    childScopes.forEach((cs) => {
      emberRouterDsl.route(cs.desc.name, { resetNamespace: true }, 
        makeRouterDslFn(cs.childScopes)
      );
    });
  }
}

class Map {
  recognizer: any;
  registry: any;
  root: MapScope;

  constructor() {
    this.recognizer = new RouteRecognizer();
    this.registry = {};

    let rootDesc = new RouteDescriptor('root', { path: '/' }, null);
    this.root = new MapScope(rootDesc);
  }

  add(children: MapChildrenFn) {
    this.root.add(children);;
  }

  getScope(name : string) {
    return this.root.getScope(name);
  }

  mount(emberRouterDsl) {
    makeRouterDslFn(this.root.childScopes).call(emberRouterDsl);
  }
}

export function createMap(desc: MapChildrenFn) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}