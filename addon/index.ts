import MountedRouter from "./-private/mounted-router";
import { RouterReducer, RouteState, RouteableReducer } from "./-private/routeable";
import { RouteOptions, Route } from "./-private/route";
import { StackOptions, StackRouter } from "./-private/routers/stack-router";

export function mount(routerMap: RouterReducer) : MountedRouter {
  return new MountedRouter(routerMap);
}

export function route(name: string, options: RouteOptions = {}) {
  return new Route(name, options);
}

export function stackRouter(name: string, children: RouteableReducer[], options: StackOptions = {}) {
  return new StackRouter(name, children, options);
}

export class Config {
  state: RouteState;
  constructor(state: RouteState) {
    this.state = state;
  }
}
