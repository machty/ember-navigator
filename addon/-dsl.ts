export interface MapChild {
  name: string;
  childrenDesc : MapChildrenFn;
  getEmberRouterDslArgs(scope: MapScope, ctx: any): any[];
}

export interface RecognizerHandler {
  key: string;
  name: string;
}

export interface RecognizerSegment {
  handler: RecognizerHandler;
  path: string;
}

export interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

export class RouteDescriptor implements MapChild {
  name: string;
  options: RouteDescriptorOptions;
  childrenDesc: MapChildrenFn;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
  }

  getEmberRouterDslArgs() {
    let path = this.options.path || this.name;
    return [this.name, Object.assign({ resetNamespace: true }, this.options)];
  }

  makeSegment(key) : RecognizerSegment {
    let path = this.options.path || this.name;
    return { path, handler: { key, name: this.name } };
  }
}

export interface StateDescriptorOptions {
  key?: string;
}

export class StateDescriptor implements MapChild {
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

  getEmberRouterDslArgs(scope, { index }) {
    let options = Object.assign({ path: '/', resetNamespace: true }, this.options);
    return [`${scope.name}-state-${index}`, options];
  }
}

export class WhenDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenFn;

  constructor(childrenDesc) {
    this.name = 'when';
    this.childrenDesc = childrenDesc;
  }

  getEmberRouterDslArgs(scope, { index }) {
    return [`${scope.name}-when-${index}`, { path: '/', resetNamespace: true }];
  }
}

const nullChildrenFn = () => [];

export type RouteDescriptorArgs = RouteDescriptorOptions | MapChildrenFn;
export function route(name: string, options: RouteDescriptorArgs = {}, childrenFn?: MapChildrenFn) : MapChild {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new RouteDescriptor(name, options, childrenFn);
}

export type StateDescriptorArgs = StateDescriptorOptions | MapChildrenFn;
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

export interface HandlerInfo {
  handler: any;
}

export type MapChildrenFn = (...any) => MapChild[];

export class MapScope {
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

function makeRouterDslFn(scope: MapScope) {
  return function(this: any) {
    let emberRouterDsl = this;
    scope.childScopes.forEach((cs, index) => {
      let [name, options] = cs.desc.getEmberRouterDslArgs(scope, { index });
      emberRouterDsl.route(name, options, makeRouterDslFn(cs));
    });
  }
}

export class Map {
  registry: any;
  root: MapScope;

  constructor() {
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
    makeRouterDslFn(this.root).call(emberRouterDsl);
  }
}

export function createMap(desc: MapChildrenFn) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}