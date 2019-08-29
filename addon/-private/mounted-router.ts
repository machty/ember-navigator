import { set } from "@ember/object";
import { RouterReducer, RouterState } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";

export class Resolver {
  resolve(): NodeDelegate | null {
    return null;
  }
}

export type MountedNodeSet = { [key: string]: MountedNode };

export interface NodeDelegate {
  update(state: any): void;
  // mount(): void;
  unmount(): void;
}

export class MountedNode {
  childNodes: MountedNodeSet;
  delegate: NodeDelegate | null;
  resolver: Resolver;
  routeableState?: any;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.delegate = this.resolver.resolve();
    // if (this.delegate) {
    //   this.delegate.mount();
    // }
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
          childNode = new MountedNode(this.resolver);
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

    if (this.delegate) {
      this.delegate.update(routeableState);
    }

    this.routeableState = routeableState;
  }

  unmount() {
    if (this.delegate) {
      this.delegate.unmount();
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
    this.rootNode = new MountedNode(resolver);
    this.router = router;
    this.state = router.getInitialState();
    this._update(this.state);
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      console.log(result.state);
      this.state = result.state;
      this._update(this.state);
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
      debugger;
    }
  }

  _update(routerState: RouterState) {
    this.rootNode.update(routerState);
  }

  navigate(options: NavigateParams) {
    this.dispatch(navigate(options));
  }

  pop(options: PopParams) {
    this.dispatch(pop(options));
  }
}
