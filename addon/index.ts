import MountedRouter from "./-private/mounted-router";
import { Router, RouteState, Routeable } from "./-private/routeable";
import { RouteOptions, Route } from "./-private/route";
import { StackOptions, StackRouter } from "./-private/routers/stack-router";

export function mount(routerMap: Router) : MountedRouter {
  return new MountedRouter(routerMap);
}

export function route(name: string, options: RouteOptions = {}) {
  return new Route(name, options);
}

export function stackRouter(name: string, children: Routeable[], options: StackOptions = {}) {
  return new StackRouter(name, children, options);
}

export class Config {
  state: RouteState;
  constructor(state: RouteState) {
    this.state = state;
  }
}
