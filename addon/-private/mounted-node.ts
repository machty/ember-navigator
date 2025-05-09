import { tracked } from "@glimmer/tracking";

import type MountedRouter from "./mounted-router";
import type { RouteableState, RouterState } from "./routeable";

export type MountedNodeSet = {
  [key: string]: MountedNode;
};

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
  @tracked childNodes: MountedNodeSet;
  @tracked routeableState: RouteableState;
  resolveResult: ResolveResult;
  id: number;
  mountedRouter: MountedRouter;
  parentNode: MountedNode | null;

  constructor(
    mountedRouter: MountedRouter,
    parentNode: MountedNode | null,
    routeableState: RouteableState
  ) {
    // TODO: odd that we pass in routeableState but don't stash it? Maybe we should call update immediately?
    this.id = ID++;
    this.mountedRouter = mountedRouter;
    this.parentNode = parentNode;
    this.routeableState = routeableState;
    this.childNodes = {};

    this.resolveResult = this.mountedRouter.resolve(
      this.routeableState.routeName,
      this.routeableState.routeOptions
    );

    this.mount();
  }

  // alias for navigatorRoute; I havve a lot of code in my app codebase that just uses route.
  get route() {
    return this.navigatorRoute;
  }

  get navigatorRoute() {
    return this.resolveResult.navigatorRoute;
  }

  update(routeableState: RouteableState) {
    // TODO: is this check needed? when else would this change?
    if (this.routeableState === routeableState) {
      return;
    }

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
    return this.mountedRouter.resolve(name, this.routeableState.routeOptions);
  }

  get componentName() {
    throw new Error(
      `MountedNode.componentName is no longer supported. If you are using component names/strings as part of your router mapping paradigm, it should be accessible on mountedNode.resolveResult.whateverYouNamedYourComponentNameProperty`
    );
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
    return !!(this.routeableState as RouterState).routes;
  }
}
