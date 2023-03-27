import { tracked } from '@glimmer/tracking';

import type MountedRouter from './mounted-router';
import type { Header } from './navigator-route';
import type NavigatorRoute from './navigator-route';
import type { RouteableState, RouterState, StackRouterState } from './routeable';

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
  @tracked childNodes: MountedNodeSet;
  @tracked routeableState: RouteableState;
  route: NavigatorRoute;
  id: number;
  // header?: any;
  mountedRouter: MountedRouter;
  parentNode: MountedNode | null;
  isFocused: boolean;

  // NOTE: a potential split-screen navigator (common in tablet/iPad apps) would
  // have multiple focused nodes -- if we add support for such a navigator, we'll
  // need to "dissolve" this singular focusedChildNode concept into multiple focusedChildNodes
  focusedChildNode: MountedNode | null;

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
    this.focusedChildNode = null;
    this.route = this.mountedRouter.createNavigatorRoute(this);
    this.isFocused = false;
    this.mount();
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

  focusNode() {
    if (this.isRouter) {
      // TODO: this might be a SwitchRouter, but they share a similar enough structure
      // that we can assume it's a StackRouter state here. Yes, this is hacky and
      // at some point it'd be good to clean up the types here.
      const stackRouterState = this.routeableState as StackRouterState;

      const nodeThatShouldHaveFocus =
        this.childNodes[stackRouterState.routes[stackRouterState.index].key];

      if (nodeThatShouldHaveFocus !== this.focusedChildNode) {
        if (this.focusedChildNode) {
          // this is our opportunity to blur the old tree and focus the new.
          // SO: how do we do that.
          this.focusedChildNode.blurNode();
          this.focusedChildNode = null;
        }

        nodeThatShouldHaveFocus.focusNode();
        this.focusedChildNode = nodeThatShouldHaveFocus;
      }
    } else {
      if (!this.isFocused) {
        this.route.focus();
      }
    }

    this.isFocused = true;
  }

  blurNode() {
    if (!this.isFocused) {
      // A node that's already blurred does not need any additional work/cleanup
      // to ensure it or its children need to be blurred.
      return;
    }

    if (this.isRouter) {
      if (this.focusedChildNode) {
        this.focusedChildNode.blurNode();
        this.focusedChildNode = null;
      }
    } else {
      this.route.blur();
    }

    this.isFocused = false;
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
    return !!(this.routeableState as RouterState).routes;
  }

  getHeaderConfig(): Header | null {
    let routerState = this.routeableState as RouterState;

    if (routerState.routes) {
      let key = routerState.routes[routerState.index].key;
      let child = this.childNodes[key];

      return child?.getHeaderConfig();
    } else {
      // this is leaf route, check the NavigatorRoute
      return this.route.header || null;
    }
  }
}
