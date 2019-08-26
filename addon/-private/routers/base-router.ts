import {
  RouteableReducer,
  RouterReducer,
  RouteState,
  ReducerResult,
  RouterState
} from "../routeable";
import { RouterActions } from "../actions/types";

export interface BaseOptions {
  componentName?: string;
}

export function handledAction(state: RouterState): ReducerResult {
  return { handled: true, state };
}

export function unhandledAction(): ReducerResult {
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

  constructor(
    name: string,
    children: RouteableReducer[],
    options: BaseOptions
  ) {
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

  childRouterNamed(name: string): RouterReducer | null {
    let child = this.childRouteables[name];
    return child.isRouter ? (child as RouterReducer) : null;
  }

  dispatchTo(routeStates: RouteState[], action: RouterActions) : RouterState | void {
    for (let routeState of routeStates) {
      let routeable = this.childRouteables[routeState.routeName];

      let childAction = action;
      // TODO: write spec for child actions
      // action.routeName === routeState.routeName && action.action
      //   ? action.action
      //   : action;

      const result = routeable.dispatch(childAction, routeState);

      if (result.handled) {
        return result.state;
      }
    }
  }
}
