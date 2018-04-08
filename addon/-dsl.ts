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
    return [this.name, Object.assign({ path, resetNamespace: true }, this.options)];
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

interface RouteReduction {
  scope: MapScope;
  children: RouteReduction[];
}

function makeRouterDslFn(rr: RouteReduction) {
  if (rr.children.length) {
    return function(this: any) {
      let emberRouterDsl = this;
      rr.children.forEach((childRr, index) => {
        let dslArgs = childRr.scope.desc.getEmberRouterDslArgs(childRr.scope, { index });
        let [name, options] = dslArgs;
        emberRouterDsl.route(name, options, makeRouterDslFn(childRr));
      });
    }
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
    let rootRoutes: any[] = [];
    this._reduceToRouteTree(rootRoutes, this.root);
    makeRouterDslFn({ scope: this.root, children: rootRoutes })!.call(emberRouterDsl);
  }

  _reduceToRouteTree(routes: any[], scope: MapScope) {
    scope.childScopes.forEach((cs) => {
      if (cs.desc instanceof RouteDescriptor) {
        let childRoutes = [];
        this._reduceToRouteTree(childRoutes, cs);
        routes.push({ scope: cs, children: childRoutes });
      } else {
        this._reduceToRouteTree(routes, cs);
      }
    });
  }
}

export function createMap(desc: MapChildrenFn) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}