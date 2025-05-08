import MountedRouter from "./-private/mounted-router";
import { RouteReducer } from "./-private/route-reducer";
import { StackRouter } from "./-private/routers/stack-router";
import { SwitchRouter } from "./-private/routers/switch-router";
import { TabRouter } from "./-private/routers/tab-router";

import type {
  BaseRouteOptions,
  ResolverFn,
  RouteableReducer,
  RouterReducer,
} from "./-private/routeable";

export {
  default as NavigatorRoute,
  type NavigatorRouteConstructorParams,
} from "./-private/navigator-route";

export function mount<RouteOptions extends BaseRouteOptions, ResolveResult>(
  routerMap: RouterReducer,
  resolveFn: ResolverFn<RouteOptions, ResolveResult>
): MountedRouter<RouteOptions, ResolveResult> {
  return new MountedRouter(routerMap, resolveFn);
}

export function route<RouteOptions extends BaseRouteOptions>(
  name: string,
  routeOptions: RouteOptions = {} as RouteOptions
) {
  return new RouteReducer(name, routeOptions);
}

export function stackRouter<RouteOptions extends BaseRouteOptions>(
  name: string,
  children: RouteableReducer[],
  routeOptions: RouteOptions = { routeName: name } as RouteOptions
) {
  return new StackRouter(name, children, routeOptions);
}

export function switchRouter<RouteOptions extends BaseRouteOptions>(
  name: string,
  children: RouteableReducer[],
  routeOptions: RouteOptions = { routeName: name } as RouteOptions
) {
  debugger;
  return new SwitchRouter(name, children, routeOptions);
}

export function tabRouter<RouteOptions extends BaseRouteOptions>(
  name: string,
  children: RouteableReducer[],
  routeOptions: RouteOptions = { routeName: name } as RouteOptions
) {
  return new TabRouter(name, children, routeOptions);
}
