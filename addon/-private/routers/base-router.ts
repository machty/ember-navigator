import type { RouterActions } from "../actions/types";
import type {
  ReducerResult,
  RouteableReducer,
  RouterReducer,
  RouterState,
  RouteState,
  BaseRouteOptions,
} from "../routeable";
export function handledAction(state: RouterState): ReducerResult {
  return { handled: true, state };
}

export function unhandledAction(): ReducerResult {
  return { handled: false };
}

export class BaseRouter {
  name: string;
  children: RouteableReducer[];
  isRouter: true;
  childRouteables: { [k: string]: RouteableReducer };
  routeOptions: BaseRouteOptions;
  routeNames: string[];

  constructor(
    name: string,
    children: RouteableReducer[],
    routeOptions: BaseRouteOptions
  ) {
    this.isRouter = true;
    this.name = name;
    this.children = children;
    this.routeNames = [];
    this.childRouteables = {};
    this.routeOptions = routeOptions;

    children.forEach((c) => {
      this.childRouteables[c.name] = c;
      this.routeNames.push(c.name);
    });
  }

  childRouterNamed(name: string): RouterReducer | null {
    let child = this.childRouteables[name];

    return child.isRouter ? (child as RouterReducer) : null;
  }

  dispatchTo(
    routeStates: RouteState[],
    action: RouterActions
  ): RouterState | void {
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
