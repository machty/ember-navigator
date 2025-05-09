import type { RouterActions } from './actions/types';
import type { MountedNode } from './mounted-node';
import type NavigatorRoute from './navigator-route';

export interface RouteableState {
  key: string;
  routeName: string;
  params: Record<string, unknown>;
  routeOptions: BaseRouteOptions;
}

export type RouteState = RouteableState;

export interface RouterState extends RouteableState {
  index: number;
  routes: RouteableState[];
}

export type StackRouterState = RouterState;

export type HandledReducerResult = {
  handled: true;
  state: RouterState;
};

export type UnhandledReducerResult = {
  handled: false;
};

export type ReducerResult = HandledReducerResult | UnhandledReducerResult;

export type InitialStateOptions = {
  key?: string;
  params?: Record<string, unknown>;
  routeOptions?: BaseRouteOptions;
};

export interface RouteableReducer {
  name: string;
  children: RouteableReducer[];
  isRouter: boolean;
  params?: Record<string, unknown>;
  getInitialState: (options?: InitialStateOptions) => RouteableState;
  dispatch: (action: RouterActions, state?: RouteableState) => ReducerResult;
  reconcile(routerState: RouteableState, mountedNode: MountedNode): void;
}

export interface RouterReducer extends RouteableReducer {
  isRouter: true;
  getInitialState: (options?: InitialStateOptions) => RouterState;
}

export interface BaseRouteOptions {
  // all routes have a route name, i.e. `route('this-is-the-route-name', { ... })`
  routeName: string;

  // e.g. 'route', 'stack', 'switch', 'tab'
  type: string;
}

// This base result is expected to be extended, either with a component name string or
// a direct reference to the component class, depending on whether you're on older ember/ember-cli
// or newer Polaris-y Ember + Embroider, which has stricter requirements re: {{component ...}} helper.
export interface BaseResolveResult {
  navigatorRoute: NavigatorRoute;
}

export type ResolverFn = (node: MountedNode) => BaseResolveResult;
