import { RouterReducer, RouterState, RouteableState, MountableNode, Resolver } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";
import NavigatorRoute from "./navigator-route";
import { set } from "@ember/object";
import { sendEvent } from '@ember/object/events';

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
export class MountedNode implements MountableNode {
  childNodes: MountedNodeSet;
  routeableState: RouteableState;
  route: NavigatorRoute;
  id: number;
  header?: any;
  mountedRouter: MountedRouter;

  constructor(mountedRouter: MountedRouter, routeableState: RouteableState) {
    // TODO: odd that we pass in routeableState but don't stash it? Maybe we should call update immediately?
    this.id = ID++;
    this.mountedRouter = mountedRouter;
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

  getHeaderConfig() : any {
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

export default class MountedRouter {
  router: RouterReducer;
  state: RouterState;
  resolver: Resolver;
  rootNode: MountedNode;

  constructor(router: RouterReducer, resolver: Resolver) {
    this.resolver = resolver;
    this.router = router;
    this.state = router.getInitialState();
    this.rootNode = new MountedNode(this, this.state);
    this._update();
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      if (this.state !== result.state) {
        console.log(result.state);
        set(this, 'state', result.state);
        this._update();
        this._sendEvents();
      }
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
    }
  }

  _sendEvents() {
    sendEvent(this, 'didTransition');
  }

  _update() {
    this.router.reconcile(this.state, this.rootNode);
  }

  navigate(options: NavigateParams) {
    this.dispatch(navigate(options));
  }

  pop(options: PopParams) {
    this.dispatch(pop(options));
  }

  resolve(name: string) {
    return this.resolver.resolve(name);
  }

  // By default, we expect the resolver to return a factory that is invoked via `create()` as factories in
  // Ember's container are. If you want to plain non-container-aware classes, you should pass a custom
  // Resolver to MountedRouter that returns an ES6 class from resolve(...). The class should have a
  // constructor accepting one argument (a MountedNode instance).

  createNavigatorRoute(node: MountedNode) {
    let RouteFactory = this.resolve(node.routeName)!;
    if (RouteFactory.create) {
      return RouteFactory.create({ node });
    } else {
      return new RouteFactory(node);
    }
  }
}
