import {
  RouterReducer,
  RouterState,
  RouteableState,
  ReducerResult
} from "../routeable";
import {
  handledAction,
  unhandledAction
} from "./base-router";
import {
  SwitchRouter,
  SwitchOptions
} from "./switch-router";
import { NavigateAction } from "../actions/types";

export interface TabOptions extends SwitchOptions {}

/* A TabRouter is a SwitchRouter that doesn't reset child state when switching between child routes */
export class TabRouter extends SwitchRouter implements RouterReducer {
  defaultKey = "TabRouterBase";

  navigateAway(action: NavigateAction, state: RouterState): ReducerResult {
    // TODO: it seems wasteful to deeply recurse on every unknown route.
    // consider adding a cache, or building one at the beginning?
    for (let i = 0; i < this.children.length; ++i) {
      if (state.index === i) {
        // skip the active route, which we already checked.
        continue;
      }

      let routeable = this.children[i];
      if (routeable.name === action.payload.routeName) {
        let childRouteState = state.routes[i];
        return this.switchToRoute(state, childRouteState, i);
      } else if (routeable.isRouter) {
        let initialChildRouteState = this.resetChildRoute(routeable);
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
    routes[i] = childRouteState;

    return handledAction({
      ...state,
      routes,
      index: i,
    });
  }
}
