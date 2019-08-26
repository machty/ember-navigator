import {
  RouteableReducer,
  RouterReducer,
  RouterState,
  RouteableState,
  InitialStateOptions,
  ReducerResult
} from "../routeable";
import {
  BaseRouter,
  BaseOptions,
  handledAction,
  unhandledAction
} from "./base-router";
import { RouterActions, NAVIGATE, NavigateAction } from "../actions/types";
import StateUtils from "../utils/state";
import invariant from "../utils/invariant";

export interface SwitchOptions extends BaseOptions {}

export class SwitchRouter extends BaseRouter implements RouterReducer {
  options: SwitchOptions;

  constructor(
    name: string,
    children: RouteableReducer[],
    options: SwitchOptions
  ) {
    super(name, children, options);
  }

  dispatch(action: RouterActions, state: RouterState) {
    debugger;

    let activeRouteState = state.routes[state.index];
    let nextRouteState = this.dispatchTo([activeRouteState], action);
    if (nextRouteState) {
      if (activeRouteState === nextRouteState) {
        // action was handled with no change, just return prior state
        return handledAction(state);
      } else {
        // action was handled and state changed; we're not switching between
        // routes, but merely updating the current one.
        let routes = [...state.routes];
        routes[state.index] = nextRouteState;
        return handledAction({
          ...state,
          routes
        });
      }
    }

    if (action.type === NAVIGATE) {
      return this.navigateAway(action, state);
    }

    return unhandledAction();
  }

  navigateAway(action: NavigateAction, state: RouterState): ReducerResult {
    let navParams = action.payload;

    // TODO: it seems wasteful to deeply recurse on every unknown route.
    // consider adding a cache, or building one at the beginning?
    for (let i = 0; i < this.children.length; ++i) {
      let routeable = this.children[i];
      if (routeable.name === navParams.routeName) {
        // let initialState = this.resetChildRoute(routeable);
        let initialState = routeable.getInitialState({
          key: navParams.key
        });
        return handledAction({
          ...StateUtils.push(state, initialState),
          isTransitioning: true
        });
      } else if (routeable.isRouter) {
        // Didn't find a matching route, but we can recurse into the router
        // to see if the route lives in there.
        let router = routeable as RouterReducer;
        let initialState = this.resetChildRoute(router);
        let navigationResult = routeable.dispatch(action, initialState);

        if (navigationResult.handled) {
          // We found the route. Now we need to replace this one.
          let routes = [...state.routes];
          let childRouteState = navigationResult.state;

          invariant(i !== state.index, "indexes shouldn't match because we've already checked the active child route");

          routes[state.index] = this.resetChildRoute(this.children[state.index]);
          routes[i] = childRouteState;

          return handledAction({
            ...state,
            routes,
            index: i,
            isTransitioning: true
          });
        }
      }
    }

    return unhandledAction();
  }

  getInitialState(options: InitialStateOptions = {}): RouterState {
    let childRoutes = this.children.map(c => this.resetChildRoute(c));
    return {
      key: options.key || "SwitchRouterBase",
      params: undefined,
      routeName: this.name,
      componentName: "ecr-switch",
      routes: childRoutes,
      index: 0,
      isTransitioning: false
    };
  }

  resetChildRoute(routeable: RouteableReducer): RouteableState {
    return routeable.getInitialState({ key: routeable.name });
  }
}
