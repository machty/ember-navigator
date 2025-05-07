import MountedRouter from './-private/mounted-router';
import { RouteReducer } from './-private/route-reducer';
import { StackRouter } from './-private/routers/stack-router';
import { SwitchRouter } from './-private/routers/switch-router';
import { TabRouter } from './-private/routers/tab-router';

import type { RouteOptions } from './-private/route-reducer';
import type { Resolver, RouteableReducer, RouterReducer } from './-private/routeable';
import type { StackOptions } from './-private/routers/stack-router';
import type { SwitchOptions } from './-private/routers/switch-router';
import type { TabOptions } from './-private/routers/tab-router';

export {
  default as NavigatorRoute,
  type NavigatorRouteConstructorParams,
} from './-private/navigator-route';

export function mount(routerMap: RouterReducer, resolver: Resolver): MountedRouter {
  return new MountedRouter(routerMap, resolver);
}

export function route(name: string, options: RouteOptions = {}) {
  return new RouteReducer(name, options);
}

export function stackRouter(
  name: string,
  children: RouteableReducer[],
  options: StackOptions = {}
) {
  return new StackRouter(name, children, options);
}

export function switchRouter(
  name: string,
  children: RouteableReducer[],
  options: SwitchOptions = {}
) {
  return new SwitchRouter(name, children, options);
}

export function tabRouter(name: string, children: RouteableReducer[], options: TabOptions = {}) {
  return new TabRouter(name, children, options);
}
