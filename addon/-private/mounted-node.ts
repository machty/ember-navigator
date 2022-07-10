import { RouterState, RouteableState } from "./routeable";
import NavigatorRoute from "./navigator-route";
import MountedRouter from "./mounted-router";

export type MountedNodeSet = { [key: string]: MountedNode };

let ID = 0;

/**
 * A MountedNode is an internal/private class that represents a node in the router tree that
 * has been fully initialized (similar to components in ember that have been fully rendered
 * into the DOM, or "mounted" components in React).
 *
 * Apps should not import, subclass, or interact with this class; instead, apps should
 * define subclasses of {NavigatorRoute}, which is the public API for customizing
 * behavior when the route is mounted.
 */

export class MountedNode {
  childNodes: MountedNodeSet;
  routeableState: RouteableState;
  route: NavigatorRoute;
  id: number;
  header?: any;
  mountedRouter: MountedRouter;
  parentNode: MountedNode | null;

  constructor(mountedRouter: MountedRouter, parentNode: MountedNode | null, routeableState: RouteableState) {
    // TODO: odd that we pass in routeableState but don't stash it? Maybe we should call update immediately?
    this.id = ID++;
    this.mountedRouter = mountedRouter;
    this.parentNode = parentNode;
    this.routeableState = routeableState;
    this.route = this.mountedRouter.createNavigatorRoute(this);
    this.childNodes = {};
    this.mount();
  }

  update(routeableState: RouteableState) {
    // TODO: is this check needed? when else would this change?
    if (this.routeableState === routeableState) { return; }

    this.route.update(routeableState);
    this.routeableState = routeableState;
  }

  mount() {
    this.route.mount();
  }

  unmount() {
    this.route.unmount();
  }

  resolve(name: string) {
    return this.mountedRouter.resolve(name);
  }

  get componentName() {
    return this.routeableState.componentName;
  }

  get routeName() {
    return this.routeableState.routeName;
  }

  get key() {
    return this.routeableState.key;
  }

  get params() {
    return this.routeableState.params;
  }

  get isRouter() {
    return !!(this.routeableState as any).routes;
  }

  getHeaderConfig(): any {
    let routerState = this.routeableState as RouterState;

    if (routerState.routes) {
      let key = routerState.routes[routerState.index].key;
      let child = this.childNodes[key];
      return child && child.getHeaderConfig();
    } else {
      // this is leaf route, check the NavigatorRoute
      return (this.route as any).header;
    }
  }
}
