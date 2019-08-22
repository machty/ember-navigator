export type ScopeDescriptorType = 'route' | 'state' | 'when';

export type DslFn = (this: RouterDsl, arg?: any) => void;
export type RouteDescriptorArgs = RouteDescriptorOptions | DslFn;

export interface ScopeDescriptor {
  name: string;
  type: ScopeDescriptorType;
  buildBlockParam(scope: MapScope, index: number) : any;
  computeKey(params: any) : string;
}

export interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

const PARAMS_REGEX = /([:*][a-z_]+)/g;
export class RouteDescriptor implements ScopeDescriptor {
  name: string;
  options: RouteDescriptorOptions;
  type: ScopeDescriptorType;
  path: string;
  paramNames: string[];

  constructor(name, options) {
    this.name = name;
    this.options = options;
    this.type = 'route';
    this.path = options.path || '/';
    this.paramNames = (this.path.match(PARAMS_REGEX) || []).map(s => s.slice(1));
  }

  buildBlockParam(scope: MapScope, index: number) {
    return { scope };
  }

  computeKey(params: any) : string {
    return `${this.name}_${this.paramNames.map(p => params[p]).join('_')}`;
  }
}

export interface HandlerInfo {
  handler: any;
}

export type MapChildrenFn = (blockParams?: any) => ScopeDescriptor[];

export class MapScope {
  childScopes: MapScope[];
  desc: ScopeDescriptor;
  childScopeRegistry: {
    [key: string]: MapScope
  };
  pathKey: string;

  constructor(desc: ScopeDescriptor, public parent: MapScope | null, public index: number) {
    this.desc = desc;
    this.childScopes = [];
    this.childScopeRegistry = {};
    if (parent) {
      this.pathKey = `${parent.pathKey}_${index}`;
    } else {
      this.pathKey = `${index}`;
    }
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

  computeKey(params: any) : string {
    return `${this.pathKey}$${this.desc.computeKey(params)}`;
  }

  get name() : string {
    return this.desc.name;
  }

  get type() : string {
    return this.desc.type;
  }
}

export class Map {
  root: MapScope;

  constructor() {
    let rootDesc = new RouteDescriptor('root', { path: '/' });
    this.root = new MapScope(rootDesc, null, 0);
  }

  getScope(name: string) {
    return this.root.getScope(name);
  }

  getScopePath(name: string) : MapScope[] {
    let leaf = this.getScope(name);
    if (!leaf) { return []; }
    let path: MapScope[] = [];
    let scope: MapScope | undefined | null = leaf;
    while (scope) {
      path.push(scope);
      scope = scope.parent;
    }
    return path.reverse();
  }
}

export interface RouterDsl {
  route(name: string, options?: RouteDescriptorArgs, callback?: DslFn) : any;
}

class RouterDslScope implements RouterDsl {
  scope: MapScope;

  constructor(scope: MapScope) {
    this.scope = scope;
  }

  route(name: string, options: RouteDescriptorArgs = {}): any {
    let desc = new RouteDescriptor(name, options);
    let index = this.scope.childScopes.length;
    let childScope = new MapScope(desc, this.scope, index);
    this.scope._registerScope(childScope);

    this.scope.childScopes.push(childScope);
  }
}

export function createMap(callback: DslFn) : Map {
  let map = new Map();
  let rootDslScope = new RouterDslScope(map.root);
  callback.call(rootDslScope);
  return map;
}