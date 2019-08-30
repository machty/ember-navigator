import { RouterReducer, RouterState, RouteableState, MountableNode, Resolver } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";
import { PublicRoute } from "./public-route";
import { set } from "@ember/object";

export type MountedNodeSet = { [key: string]: MountedNode };

let ID = 0;

// A MountedNode is the "internal" stateful node that the routing API doesn't have access to.
// The Route is the public API object that we pass into components.

export class MountedNode implements MountableNode {
  childNodes: MountedNodeSet;
  resolver: Resolver;
  routeableState?: RouteableState;
  componentName: string;
  route: PublicRoute;
  key: string;
  id: number;
  header?: any;

  constructor(resolver: Resolver, routeableState: RouteableState) {
    // TODO: odd that we pass in routeableState but don't stash it? Maybe we should call update immediately?
    this.id = ID++;
    this.componentName = routeableState.componentName;
    this.key = routeableState.key;
    this.resolver = resolver;
    let RouteConstuctor = this.resolver.resolve(this.componentName) || PublicRoute;
    this.route = new RouteConstuctor(this);
    this.childNodes = {};
  }

  update(routeableState: RouteableState) {
    // TODO: is this check needed? when else would this change?
    if (this.routeableState === routeableState) { return; }

    this.route.update(routeableState);
    this.routeableState = routeableState;
  }

  unmount() {
    this.route.unmount();
  }

  getHeaderConfig() : any {
    let routerState = this.routeableState as RouterState;

    if (routerState.routes) {
      let key = routerState.routes[routerState.index].key;
      let child = this.childNodes[key];
      return child && child.getHeaderConfig();
    } else {
      // this is leaf route, check the PublicRoute
      return this.route.header;
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
    this.rootNode = new MountedNode(resolver, this.state);
    this._update();
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      if (this.state !== result.state) {
        console.log(result.state);
        set(this, 'state', result.state);
        this._update();
      }
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
    }
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
}
