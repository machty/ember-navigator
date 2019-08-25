import {
  RouteableReducer,
  RouterReducer,
  RouterState,
  RouteableState,
  InitialStateOptions
} from "../routeable";
import {
  BaseRouter,
  BaseOptions,
  handledAction,
  unhandledAction
} from "./base-router";
import { RouterActions, NAVIGATE } from "../actions/types";

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
        routes[state.index] = activeRouteState;
        return handledAction({
          ...state
        });
      }
    }

    if (action.type === NAVIGATE) {
      // let nextRouteState = this.delegateNavigationToActiveChildRouters(action, state) ||
      //                      this.navigateToPreexisting(action, state) ||
      //                      this.navigateToNew(action, state);

      debugger;
    }

    return unhandledAction();
  }

  getInitialState(_options: InitialStateOptions = {}): RouterState {
    let childRoutes = this.children.map(c => this.resetChildRoute(c));
    return {
      key: "SwitchRouterBase",
      params: undefined,
      routeName: this.name,
      componentName: "ecr-switch",
      routes: childRoutes,
      index: 0,
      isTransitioning: false
    };
  }

  resetChildRoute(routeable: RouteableReducer): RouteableState {
    return routeable.getInitialState();
  }
}
