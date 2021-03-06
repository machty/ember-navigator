import MountedRouter from "./-private/mounted-router";
import { RouterReducer, RouteableReducer, Resolver } from "./-private/routeable";
import { RouteOptions, Route } from "./-private/route";
import { StackOptions, StackRouter } from "./-private/routers/stack-router";
import { SwitchOptions, SwitchRouter } from "./-private/routers/switch-router";
import { TabOptions, TabRouter } from "./-private/routers/tab-router";
import { PublicRoute } from "./-private/public-route";

export function mount(routerMap: RouterReducer, resolver: Resolver) : MountedRouter {
  return new MountedRouter(routerMap, resolver)
}

export function route(name: string, options: RouteOptions = {}) {
  return new Route(name, options);
}

export function stackRouter(name: string, children: RouteableReducer[], options: StackOptions = {}) {
  return new StackRouter(name, children, options);
}

export function switchRouter(name: string, children: RouteableReducer[], options: SwitchOptions = {}) {
  return new SwitchRouter(name, children, options);
}

export function tabRouter(name: string, children: RouteableReducer[], options: TabOptions = {}) {
  return new TabRouter(name, children, options);
}

export const NavigatorRoute = PublicRoute;
