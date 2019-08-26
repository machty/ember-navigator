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
    switch(action.type) {
      case NAVIGATE:
        return this.navigate(action, state);
    }

    return unhandledAction();
  }

  navigate(action: NavigateAction, state: RouterState): ReducerResult {
    // TODO: params!

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

    let routeName = action.payload.routeName;
    if (activeRouteState.routeName === routeName) {
      // TODO: params
      return handledAction(state);
    }

    return this.navigateAway(action, state);
  }

  navigateAway(action: NavigateAction, state: RouterState): ReducerResult {
    // TODO: it seems wasteful to deeply recurse on every unknown route.
    // consider adding a cache, or building one at the beginning?
    for (let i = 0; i < this.children.length; ++i) {
      if (state.index === i) {
        // skip the active route, which we already checked.
        continue;
      }

      let routeable = this.children[i];
      let initialChildRouteState = this.resetChildRoute(routeable);
      if (routeable.name === action.payload.routeName) {
        return this.switchToRoute(state, initialChildRouteState, i);
      } else if (routeable.isRouter) {
        let navigationResult = routeable.dispatch(action, initialChildRouteState);
        if (navigationResult.handled) {
          return this.switchToRoute(state, navigationResult.state, i);
        }
      }
    }

    return unhandledAction();
  }

  switchToRoute(state: RouterState, childRouteState: RouteableState, i: number) {
    let routes = [...state.routes];

    routes[state.index] = this.resetChildRoute(this.children[state.index]);
    routes[i] = childRouteState;

    return handledAction({
      ...state,
      routes,
      index: i,
      isTransitioning: true
    });
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
