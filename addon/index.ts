import MountedRouter from "./-private/mounted-router";
import { Router, RouteState } from "./-private/routeable";

export function mount(routerMap: Router) : MountedRouter {
  return new MountedRouter(routerMap);
}

export class Config {
  state: RouteState;
  constructor(state: RouteState) {
    this.state = state;
  }
}
