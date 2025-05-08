import { generateKey } from './key-generator';

import type { RouterActions } from './actions/types';
import type { MountedNode } from './mounted-node';
import type {
  BaseRouteOptions,
  InitialStateOptions,
  RouteableReducer,
  RouterState,
  RouteState,
  UnhandledReducerResult,
} from './routeable';

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
export class RouteReducer<RouteOptions extends BaseRouteOptions> implements RouteableReducer {
  name: string;
  children: RouteableReducer[];
  routeOptions: RouteOptions;
  isRouter: false;

  constructor(name: string, routeOptions: RouteOptions) {
    this.isRouter = false;
    this.name = name;
    this.children = [];
    this.routeOptions = routeOptions;
  }

  getInitialState(options: InitialStateOptions = {}): RouteState {
    return {
      params: options.params || {},
      routeName: this.name,
      key: options.key || generateKey(),
      routeOptions: this.routeOptions,
    };
  }

  // TODO: remove this?
  dispatch(_action: RouterActions, _state: RouterState): UnhandledReducerResult {
    return { handled: false };
  }

  reconcile(routeState: RouteState, mountedNode: MountedNode<RouteOptions, any>) {
    mountedNode.update(routeState);
  }
}
