import {
  RouteableReducer,
  RouteState,
  RouterState,
  UnhandledReducerResult,
  InitialStateOptions
} from "./routeable";
import { generateKey } from "./key-generator";
import { RouterActions } from "./actions/types";
import { MountedNode } from "./mounted-router";

export type RouteOptions = {
  componentName?: string;
};

/**
 * This is the reducer object returned by the `route()` function in the mapping DSL, e.g.
 *
 *    [
 *       route('home'),
 *       route('customer', { path: 'customer/:customer_id' }),
 *    ]
 *
 * It represents a leaf (child-less) route in the routing tree.
 */
export class RouteReducer implements RouteableReducer {
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

  reconcile(routeState: RouteState, mountedNode: MountedNode) {
    mountedNode.update(routeState);
  }
}
