export type ScopeDescriptorType = 'route' | 'state' | 'when';

type DslFn = (this: RouterDsl, arg?: any) => void;
export type RouteDescriptorArgs = RouteDescriptorOptions | DslFn;

export interface ScopeDescriptor {
  name: string;
  type: ScopeDescriptorType;
  buildBlockParam(scope: MapScope, index: number) : any;
}

export interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

export class RouteDescriptor implements ScopeDescriptor {
  name: string;
  options: RouteDescriptorOptions;
  type: ScopeDescriptorType;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.type = 'route';
  }

  buildBlockParam(scope: MapScope, index: number) {
    return { scope };
  }
}

export interface StateDescriptorOptions {
  key?: string;
}

export class StateDescriptor implements ScopeDescriptor {
  name: string;
  options: StateDescriptorOptions;
  type: ScopeDescriptorType;

  constructor(name, options) {
    this.name = name;
    this.options = options;
    this.type = 'state';
  }

  buildBlockParam(scope: MapScope, index: number) {
    return {
      match: (conditionObj: any, fn: MapChildrenFn) => {
        return new WhenDescriptor(conditionObj, scope, fn);
      }
    };
  }
}

export class WhenDescriptor implements ScopeDescriptor {
  name: string;
  childrenDesc: MapChildrenFn;
  type: ScopeDescriptorType;
  condition: any;
  source: MapScope;

  constructor(condition: any, source: MapScope, childrenDesc) {
    this.name = 'when';
    this.childrenDesc = childrenDesc;
    this.type = 'when';
    this.source = source;
    this.condition = condition;
  }

  buildBlockParam(scope: MapScope, index: number) {
    return { scope };
  }
}

const nullChildrenFn = () => [];

export interface HandlerInfo {
  handler: any;
}

export type MapChildrenFn = (blockParams?: any) => ScopeDescriptor[];

export class MapScope {
  childScopes: MapScope[];
  desc: ScopeDescriptor;
  parent?: MapScope;
  childScopeRegistry: {
    [key: string]: MapScope
  };

  constructor(desc: ScopeDescriptor, parent?: MapScope) {
    this.desc = desc;
    this.childScopes = [];
    this.childScopeRegistry = {};
    this.parent = parent;
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

  get type() : string {
    return this.desc.type;
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
        let rdesc = childRr.scope.desc as RouteDescriptor;

        // TODO: provide default path for non resetNamespace fully qualified route names
        let options = Object.assign({ resetNamespace: true }, rdesc.options);
        emberRouterDsl.route(rdesc.name, options, makeRouterDslFn(childRr));
      });
    }
  }
}

export class Map {
  root: MapScope;

  constructor() {
    let rootDesc = new RouteDescriptor('root', { path: '/' }, null);
    this.root = new MapScope(rootDesc);
  }

  getScope(name: string) {
    return this.root.getScope(name);
  }

  getScopePath(name: string) : MapScope[] {
    let leaf = this.getScope(name);
    if (!leaf) { return []; }
    let path: MapScope[] = [];
    let scope: MapScope | undefined = leaf;
    while (scope) {
      path.push(scope);
      scope = scope.parent;
    }
    return path.reverse();
  }

  mount(emberRouterDsl) {
    let rootRoutes: any[] = [];
    this._reduceToRouteTree(rootRoutes, this.root);
    makeRouterDslFn({ scope: this.root, children: rootRoutes })!.call(emberRouterDsl);
  }

  _reduceToRouteTree(routes: any[], scope: MapScope) {
    scope.childScopes.forEach((cs) => {
      if (cs.type === 'route') {
        let childRoutes = [];
        this._reduceToRouteTree(childRoutes, cs);
        routes.push({ scope: cs, children: childRoutes });
      } else {
        this._reduceToRouteTree(routes, cs);
      }
    });
  }
}

interface RouterDsl {
  route(name: string, options?: RouteDescriptorArgs, callback?: DslFn) : any;
  state(name: string, options?: RouteDescriptorArgs, callback?: DslFn) : any;
  match(blockParam: any, cond: string, callback: DslFn) : any;
}

class RouterDslScope implements RouterDsl {
  scope: MapScope;

  constructor(scope: MapScope) {
    this.scope = scope;
  }

  route(name: string, options: RouteDescriptorArgs = {}, callback?: DslFn): any {
    if (arguments.length === 2 && typeof options === 'function') {
      callback = options;
      options = {}
    }

    let desc = new RouteDescriptor(name, options, callback);
    let childScope = new MapScope(desc, this.scope);
    this.scope._registerScope(childScope);

    if (callback) {
      let childDslScope = new RouterDslScope(childScope);
      callback.call(childDslScope);
    }

    this.scope.childScopes.push(childScope);
  }

  state(name: string, options: RouteDescriptorArgs = {}): MapScope {
    let desc = new StateDescriptor(name, options);
    let childScope = new MapScope(desc, this.scope);
    this.scope._registerScope(childScope);
    this.scope.childScopes.push(childScope);
    return childScope;
  }

  match(blockParam: MapScope, cond: string, callback: DslFn) {
    let desc = new WhenDescriptor(cond, blockParam, callback);
    let childScope = new MapScope(desc, this.scope);

    if (callback) {
      let childDslScope = new RouterDslScope(childScope);
      callback.call(childDslScope);
    }

    this.scope.childScopes.push(childScope);
  }
}

export function createMap(callback: DslFn) : Map {
  let map = new Map();
  let rootDslScope = new RouterDslScope(map.root);
  callback.call(rootDslScope);
  return map;
}