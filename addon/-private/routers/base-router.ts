import { RouteableReducer, RouterReducer, RouterState, RouteState, ReducerResult } from '../routeable';

export interface BaseOptions {
  componentName?: string;
}

export function handledAction(state) : ReducerResult {
  return { handled: true, state };
}

export function unhandledAction() : ReducerResult {
  return { handled: false };
}

export class BaseRouter {
  name: string;
  children: RouteableReducer[];
  componentName: string;
  isRouter: true;
  childRouteables: { [k: string]: RouteableReducer };
  options: BaseOptions;
  routeNames: string[];

  constructor(name: string, children: RouteableReducer[], options: BaseOptions) {
    this.isRouter = true;
    this.name = name;
    this.children = children;
    this.routeNames = [];
    this.childRouteables = {};
    this.options = options;

    children.forEach(c => {
      this.childRouteables[c.name] = c;
      this.routeNames.push(c.name);
    });

    this.componentName = this.options.componentName || "ecr-stack";
  }

  childRouterNamed(name: string) : RouterReducer | null {
    let child = this.childRouteables[name];
    return child.isRouter ? child as RouterReducer : null;
  }
}
