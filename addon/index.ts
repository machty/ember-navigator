import MountedRouter from "./-private/mounted-router";
import { Router } from "./-private/routeable";

export function mount(routerMap: Router) : MountedRouter {
  return new MountedRouter(routerMap);
}
