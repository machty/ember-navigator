import type { RouterActions } from "./actions/types";
import type { MountedNode } from "./mounted-node";
import type NavigatorRoute from "./navigator-route";

export interface RouteableState<RouteOptions extends BaseRouteOptions> {
  key: string;
  routeName: string;
  params: Record<string, unknown>;
  routeOptions: RouteOptions;
}

export type RouteState<RouteOptions extends BaseRouteOptions> =
  RouteableState<RouteOptions>;

export interface RouterState<RouteOptions extends BaseRouteOptions>
  extends RouteableState<RouteOptions> {
  index: number;
  routes: RouteableState<RouteOptions>[];
}

export interface StackRouterState<RouteOptions extends BaseRouteOptions>
  extends RouterState<RouteOptions> {}

export type HandledReducerResult<RouteOptions extends BaseRouteOptions> = {
  handled: true;
  state: RouterState<RouteOptions>;
};

export type UnhandledReducerResult = {
  handled: false;
};

export type ReducerResult<RouteOptions extends BaseRouteOptions> =
  | HandledReducerResult<RouteOptions>
  | UnhandledReducerResult;

export type InitialStateOptions<RouteOptions extends BaseRouteOptions> = {
  key?: string;
  params?: Record<string, unknown>;
  routeOptions?: RouteOptions;
};

export interface RouteableReducer<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult
> {
  name: string;
  children: RouteableReducer<RouteOptions, ResolveResult>[];
  isRouter: boolean;
  params?: Record<string, unknown>;
  getInitialState: (
    options?: InitialStateOptions<RouteOptions>
  ) => RouteableState<RouteOptions>;
  dispatch: (
    action: RouterActions,
    state?: RouteableState<RouteOptions>
  ) => ReducerResult<RouteOptions>;
  reconcile(
    routerState: RouteableState<RouteOptions>,
    mountedNode: MountedNode<RouteOptions, ResolveResult>
  ): void;
}

export interface RouterReducer<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult
> extends RouteableReducer<RouteOptions, ResolveResult> {
  isRouter: true;
  getInitialState: (
    options?: InitialStateOptions<RouteOptions>
  ) => RouterState<RouteOptions>;
}

export interface BaseRouteOptions {
  // all routes have a route name, i.e. `route('this-is-the-route-name', { ... })`
  routeName: string;
}

// This base result is expected to be extended, either with a component name string or
// a direct reference to the component class, depending on whether you're on older ember/ember-cli
// or newer Polaris-y Ember + Embroider, which has stricter requirements re: {{component ...}} helper.
export interface BaseResolveResult<RouteOptions extends BaseRouteOptions> {
  navigatorRoute: NavigatorRoute<RouteOptions, any>;
}

export type ResolverFn<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult<RouteOptions>
> = (componentName: string, options: RouteOptions) => ResolveResult;
