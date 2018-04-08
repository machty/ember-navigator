type ScopeDescriptorType = 'route' | 'state' | 'when';

export interface ScopeDescriptor {
  name: string;
  childrenDesc : MapChildrenFn;
  type: ScopeDescriptorType;
  buildBlockParam(scope: MapScope, index: number) : any;
}

export interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

interface ValidationFailure {
}



export class RouteDescriptor implements ScopeDescriptor {
  name: string;
  options: RouteDescriptorOptions;
  childrenDesc: MapChildrenFn;
  type: ScopeDescriptorType;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
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
  childrenDesc: MapChildrenFn;
  type: ScopeDescriptorType;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
    this.type = 'state';
  }

  buildBlockParam(scope: MapScope, index: number) {
    return {
      match: (conditionObj: any, fn: MapChildrenFn) => {
        return new WhenDescriptor(conditionObj, scope, fn);
      }
    };
  }

  validateMatch(when: WhenDescriptor, context: any) : ValidationFailure | void {
    let stateObj = context.get(this.name);
    if (!stateObj) {
      throw new Error(`ember-constraint-router: couldn't find backing service for ${this.name}`)
    }

    // let isValid = stateObj.validateConstraint(when.condition);
    return stateObj.validateConstraint(when.condition);

    // if (isValid) {
    //   // yes
    // } else {
    //   // decide how to fix validation.
    // }

    // as the service or whatever it is whether it's still valid.
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

  // validatePresence(context) {
  //   let stateDesc = this.source.desc as StateDescriptor;
  //   return stateDesc.validateMatch(this, context);
  // }
}

const nullChildrenFn = () => [];

export type RouteDescriptorArgs = RouteDescriptorOptions | MapChildrenFn;
export function route(name: string, options: RouteDescriptorArgs = {}, childrenFn?: MapChildrenFn) : ScopeDescriptor {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new RouteDescriptor(name, options, childrenFn);
}

export type StateDescriptorArgs = StateDescriptorOptions | MapChildrenFn;
export function state(name: string, options: StateDescriptorArgs = {}, childrenFn?: MapChildrenFn) : ScopeDescriptor {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new StateDescriptor(name, options, childrenFn);
}

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

  add(childrenDesc: MapChildrenFn, blockParam?: any) {
    let children = childrenDesc ? childrenDesc(blockParam) : [];

    children.forEach((child, index) => {
      let childScope = new MapScope(child, this);
      childScope.add(child.childrenDesc, child.buildBlockParam(childScope, index));
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

export function createMap(desc: MapChildrenFn) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}