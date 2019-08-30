import {
  NAVIGATE,
  NavigateAction,
  BACK,
  RouterActions,
  POP,
  PopAction,
  BackAction
} from "../actions/types";
import {
  RouterReducer,
  RouterState,
  ReducerResult,
  InitialStateOptions,
  StackRouterState
} from "../routeable";
import StateUtils from "../utils/state";
import {
  BaseRouter,
  BaseOptions,
  handledAction,
  unhandledAction
} from "./base-router";
import { MountedNodeSet, MountedNode } from "../mounted-router";

export interface StackOptions extends BaseOptions {
  headerComponentName?: string;
  headerMode?: string; // TODO: type enum
}

export class StackRouter extends BaseRouter implements RouterReducer {
  dispatch(action: RouterActions, state: RouterState) {
    switch (action.type) {
      case NAVIGATE:
        return this.navigate(action, state);
      case BACK:
        return this.goBack(action, state);
      case POP:
        return this.popStack(action, state);
    }

    return unhandledAction();
  }

  navigate(action: NavigateAction, state: RouterState): ReducerResult {
    return this.delegateNavigationToActiveChildRouters(action, state) ||
           this.navigateToPreexisting(action, state) ||
           this.navigateToNew(action, state) ||
           unhandledAction();
  }

  delegateNavigationToActiveChildRouters(
    action: NavigateAction,
    state: RouterState
  ): ReducerResult | void {
    // Traverse routes from the top of the stack to the bottom, so the
    // active route has the first opportunity, then the one before it, etc.
    let reversedStates = state.routes.slice().reverse();
    let nextRouteState = this.dispatchTo(reversedStates, action);
    if (!nextRouteState) {
      return;
    }

    const newState = StateUtils.replaceAndPrune(
      state,
      nextRouteState.key,
      nextRouteState
    );

    return handledAction(newState);
  }

  navigateToPreexisting(
    action: NavigateAction,
    state: RouterState
  ): ReducerResult | void {
    let navParams = action.payload;
    if (!this.childRouteables[navParams.routeName]) {
      return;
    }

    const lastRouteIndex = state.routes.findIndex(r => {
      if (navParams.key) {
        return r.key === navParams.key;
      } else {
        return r.routeName === navParams.routeName;
      }
    });

    if (lastRouteIndex === -1) {
      return;
    }

    // If index is unchanged and params are not being set, leave state identity intact
    if (state.index === lastRouteIndex && !navParams.params) {
      return handledAction(state);
    }

    // Remove the now unused routes at the tail of the routes array
    const routes = state.routes.slice(0, lastRouteIndex + 1);

    // Apply params if provided, otherwise leave route identity intact
    if (navParams.params) {
      const route = state.routes[lastRouteIndex];
      routes[lastRouteIndex] = {
        ...route,
        params: {
          ...route.params,
          ...navParams.params
        }
      };
    }
    // Return state with new index
    return handledAction({
      ...state,
      index: lastRouteIndex,
      routes
    });
  }

  navigateToNew(
    action: NavigateAction,
    state: RouterState
  ): ReducerResult | void {
    let navParams = action.payload;
    // TODO: it seems wasteful to deeply recurse on every unknown route.
    // consider adding a cache, or building one at the beginning?
    for (let i = 0; i < this.children.length; ++i) {
      let routeable = this.children[i];
      if (routeable.name === navParams.routeName) {
        let initialState = routeable.getInitialState({
          key: navParams.key,
          params: navParams.params,
        });
        return handledAction(StateUtils.push(state, initialState));
      } else {
        let initialState = routeable.getInitialState();
        // not a match, recurse

        let navigationResult = routeable.dispatch(action, initialState);
        if (navigationResult.handled) {
          let childRouteState = navigationResult.state;
          return handledAction(StateUtils.push(state, childRouteState));
        }
      }
    }
  }

  goBack(action: BackAction, _state: RouterState): ReducerResult {
    let key = action.payload.key;
    if (key) {
      // If set, navigation will go back from the given key
      // const backRoute = state.routes.find(route => route.key === key);
      // backRouteIndex = backRoute ? state.routes.indexOf(backRoute) : -1;
      return notImplemented("goBack with key");
    } else if (key === null) {
      // navigation will go back anywhere.
      return notImplemented("goBack with null key");
    } else {
      // TODO: what happens here?
      return notImplemented("goBack with missing key");
    }
  }

  popStack(action: PopAction, state: RouterState): ReducerResult {
    // determine the index to go back *from*. In this case, n=1 means to go
    // back from state.index, as if it were a normal "BACK" action
    const n = action.payload.n || 1;
    const backRouteIndex = Math.max(1, state.index - n + 1);

    return backRouteIndex > 0
      ? handledAction({
          ...state,
          routes: state.routes.slice(0, backRouteIndex),
          index: backRouteIndex - 1
        })
      : unhandledAction();
  }

  getInitialState(options: InitialStateOptions = {}): StackRouterState {
    const initialRouteName = this.routeNames[0];
    let childRouteableState = this.childRouteables[
      initialRouteName
    ].getInitialState({
      // routeName: initialRouteName,
      params: null
    });

    return {
      key: options.key || "StackRouterRoot",
      index: 0,
      routes: [childRouteableState],
      componentName: this.componentName,

      // TODO: in RN, the root stack navigator doesn't have params/routeName; are we doing it wrong?
      params: {},
      routeName: this.name,
      headerComponentName: (this.options as StackOptions).headerComponentName || "ecr-header",
      headerMode: (this.options as StackOptions).headerMode || 'float',
    };
  }

  reconcile(routerState: RouterState, mountedNode: MountedNode) {
    let currentChildNodes = mountedNode.childNodes;
    let nextChildNodes: MountedNodeSet = {};

    routerState.routes.forEach(childRouteState => {
      let childNode = currentChildNodes[childRouteState.key];
      if (childNode && childNode.routeableState === childRouteState) {
        // child state hasn't changed in any way, don't recurse/update
        return;
      } else if (!childNode) {
        childNode = new MountedNode(mountedNode.resolver, childRouteState);
      }

      let childRouteableReducer = this.childRouteables[childRouteState.routeName];
      childRouteableReducer.reconcile(childRouteState, childNode);

      // childNode.update(childRouteState)
      nextChildNodes[childRouteState.key] = childNode;
    });

    Object.keys(currentChildNodes).forEach(key => {
      if (nextChildNodes[key]) {
        return;
      }
      currentChildNodes[key].unmount();
    });

    mountedNode.childNodes = nextChildNodes;
  }
}

function notImplemented(message: string) {
  console.error(`NOT IMPLEMENTED: ${message}`);
  return unhandledAction();
}
