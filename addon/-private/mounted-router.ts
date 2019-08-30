import { RouterReducer, RouterState, RouteableState, MountableNode, Resolver } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";
import { PublicRoute } from "./public-route";
import { set } from "@ember/object";

export type MountedNodeSet = { [key: string]: MountedNode };

// A MountedNode is the "internal" stateful node that the routing API doesn't have access to.
// The Route is the public API object that we pass into components.

export class MountedNode implements MountableNode {
  childNodes: MountedNodeSet;
  resolver: Resolver;
  routeableState?: RouteableState;
  componentName: string;
  route: PublicRoute;

  constructor(resolver: Resolver, componentName: string) {
    this.componentName = componentName;
    this.resolver = resolver;
    let RouteConstuctor = this.resolver.resolve(componentName) || PublicRoute;
    this.route = new RouteConstuctor(this);
    this.childNodes = {};
  }

  update(routeableState: RouteableState) {
    if (this.routeableState === routeableState) { return; }

    if ((routeableState as any).routes) {
      let currentChildNodes = this.childNodes;
      let nextChildNodes: MountedNodeSet = {};
      let routerState: RouterState = routeableState as RouterState;

      routerState.routes.forEach(childRouteState => {
        let childNode = currentChildNodes[childRouteState.key];
        if (!childNode) {
          childNode = new MountedNode(this.resolver, childRouteState.componentName);
        }
        childNode.update(childRouteState);
        nextChildNodes[childRouteState.key] = childNode;
      });

      Object.keys(currentChildNodes).forEach(key => {
        if (nextChildNodes[key]) {
          return;
        }
        currentChildNodes[key].unmount();
      });

      this.childNodes = nextChildNodes;
    }

    debugger;
    this.route.update(routeableState);
    this.routeableState = routeableState;
  }

  unmount() {
    this.route.unmount();
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
    this.rootNode = new MountedNode(resolver, this.state.componentName);
    this._update();
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      console.log(result.state);
      set(this, 'state', result.state);
      // this.state = result.state;
      this._update();
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
      debugger;
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
