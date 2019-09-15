import {
  RouteReducer,
  RouteableReducer,
  RouteState,
  RouterState,
  UnhandledReducerResult,
  InitialStateOptions
} from "./routeable";
import { generateKey } from "./key-generator";
import { RouterActions, NAVIGATE, NavigateAction } from "./actions/types";
import { MountedNode } from "./mounted-router";

export type RouteOptions = {
  componentName?: string;
};

export class Route implements RouteReducer {
  name: string;
  children: RouteableReducer[];
  options: RouteOptions;
  isRouter: false;
  componentName: string;

  constructor(name: string, options: RouteOptions) {
    this.isRouter = false;
    this.name = name;
    this.children = [];
    this.options = options;
    this.componentName = options.componentName || name;
  }

  getInitialState(options: InitialStateOptions = {}): RouteState {
    let routeName = this.name;
    return {
      params: options.params,
      routeName,
      key: options.key || generateKey(),
      componentName: routeName
    };
  }

  // TODO: remove this?
  dispatch(_action: RouterActions, _state: RouterState): UnhandledReducerResult {
    return { handled: false };
  }

  reconcile(routeState: RouteState, mountedNode: MountedNode, action: RouterActions) {
    mountedNode.update(routeState);
    if (action.type === NAVIGATE) {
      let navigateAction = action as NavigateAction;
      if (navigateAction.payload.routeName === routeState.routeName) {
        let actionKey = navigateAction.payload.key;
        if (!actionKey || actionKey === routeState.key) {
          mountedNode.didNavigate(navigateAction.payload.params);
        }
      }
    }
  }
}
