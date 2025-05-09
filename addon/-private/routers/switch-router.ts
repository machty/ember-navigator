import { NAVIGATE } from '../actions/types';
import { MountedNode } from '../mounted-node';
import { BaseRouter, handledAction, unhandledAction } from './base-router';

import type { NavigateAction, RouterActions } from '../actions/types';
import type { MountedNodeSet } from '../mounted-node';
import type {
  InitialStateOptions,
  ReducerResult,
  RouteableReducer,
  RouteableState,
  RouterReducer,
  RouterState,
} from '../routeable';

export class SwitchRouter extends BaseRouter implements RouterReducer {
  defaultKey = 'SwitchRouterBase';

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

        routes[state.index] = nextRouteState;

        return handledAction({
          ...state,
          routes,
        });
      }
    }

    switch (action.type) {
      case NAVIGATE:
        return this.navigate(action, state);
    }

    return unhandledAction();
  }

  navigate(action: NavigateAction, state: RouterState): ReducerResult {
    // TODO: params!

    let activeRouteState = state.routes[state.index];
    let routeName = action.payload.routeName;

    if (activeRouteState.routeName === routeName) {
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
    });
  }

  getInitialState(options: InitialStateOptions = {}): RouterState {
    let childRoutes = this.children.map((c) => this.resetChildRoute(c));

    return {
      key: options.key || this.defaultKey,
      params: {},
      routeName: this.name,
      routeOptions: this.routeOptions,
      routes: childRoutes,
      index: 0,
    };
  }

  resetChildRoute(routeable: RouteableReducer): RouteableState {
    return routeable.getInitialState({ key: routeable.name });
  }

  // accept new router state and use it to update the mounted node,
  // calling various lifecycle hooks as you go
  reconcile(routerState: RouterState, mountedNode: MountedNode) {
    let currentChildNodes = mountedNode.childNodes;
    let nextChildNodes: MountedNodeSet = {};

    let activeChildRouteState = routerState.routes[routerState.index];
    let currentActiveNode = currentChildNodes[activeChildRouteState.key];

    if (!currentActiveNode) {
      currentActiveNode = new MountedNode(
        mountedNode.mountedRouter,
        mountedNode,
        activeChildRouteState
      );
    }

    let childRouteableReducer = this.childRouteables[activeChildRouteState.routeName];

    childRouteableReducer.reconcile(activeChildRouteState, currentActiveNode);

    nextChildNodes[activeChildRouteState.key] = currentActiveNode;

    Object.keys(currentChildNodes).forEach((key) => {
      if (nextChildNodes[key]) {
        return;
      }

      currentChildNodes[key].unmount();
    });

    // TODO: this ceremony is duplicated with stack router. consolidate? move all this into mountedNode.update??
    mountedNode.childNodes = nextChildNodes;
    mountedNode.update(routerState);
  }
}
