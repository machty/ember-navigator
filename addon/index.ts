import MountedRouter from './-private/mounted-router';
import { RouteReducer } from './-private/route-reducer';
import { StackRouter } from './-private/routers/stack-router';
import { SwitchRouter } from './-private/routers/switch-router';
import { TabRouter } from './-private/routers/tab-router';

import type { ResolverFn, RouteableReducer, RouterReducer } from './-private/routeable';

export { default as NavigatorRoute } from './-private/navigator-route';

export function mount(routerMap: RouterReducer, resolveFn: ResolverFn): MountedRouter {
  return new MountedRouter(routerMap, resolveFn);
}

export function route(name: string, routeOptions: Record<string, unknown> = {}) {
  return new RouteReducer(name, {
    routeName: name,
    type: 'route',
    ...routeOptions,
  });
}

export function stackRouter(
  name: string,
  children: RouteableReducer[],
  routeOptions: Record<string, unknown> = {}
) {
  return new StackRouter(name, children, {
    routeName: name,
    type: 'stack',
    ...routeOptions,
  });
}

export function switchRouter(
  name: string,
  children: RouteableReducer[],
  routeOptions: Record<string, unknown> = {}
) {
  return new SwitchRouter(name, children, {
    routeName: name,
    type: 'switch',
    ...routeOptions,
  });
}

export function tabRouter(
  name: string,
  children: RouteableReducer[],
  routeOptions: Record<string, unknown> = {}
) {
  return new TabRouter(name, children, {
    routeName: name,
    type: 'tab',
    ...routeOptions,
  });
}

export type { RouterActions } from './-private/actions/types';
export type { MountedNode } from './-private/mounted-node';
export type {
  BaseRouteOptions,
  ResolverFn,
  RouteableReducer,
  RouterReducer,
  RouterState,
} from './-private/routeable';

export type { MountedRouter };
