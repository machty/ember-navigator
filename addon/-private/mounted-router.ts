import { set } from "@ember/object";
import { sendEvent } from "@ember/object/events";

import { navigate, pop } from "./actions/actions";
import { MountedNode } from "./mounted-node";

import type { NavigateParams, PopParams, RouterActions } from "./actions/types";
import type {
  BaseResolveResult,
  BaseRouteOptions,
  ResolverFn,
  RouterReducer,
  RouterState,
} from "./routeable";

export default class MountedRouter<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult
> {
  router: RouterReducer;
  state: RouterState;
  resolverFn: ResolverFn<RouteOptions, ResolveResult>;
  rootNode: MountedNode<RouteOptions, ResolveResult>;

  constructor(
    router: RouterReducer,
    resolverFn: ResolverFn<RouteOptions, ResolveResult>
  ) {
    this.resolverFn = resolverFn;
    this.router = router;
    this.state = router.getInitialState();
    this.rootNode = new MountedNode(this, null, this.state);
    this._update();
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);

    if (result.handled) {
      if (this.state !== result.state) {
        set(this, "state", result.state);
        this._update();
        this._sendEvents();
      }
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
    }
  }

  _sendEvents() {
    sendEvent(this, "didTransition");
  }

  _update() {
    this.router.reconcile(this.state, this.rootNode);
  }

  navigate(options: NavigateParams) {
    this.dispatch(navigate(options));
  }

  pop(options: PopParams | undefined) {
    this.dispatch(pop(options));
  }

  resolve(routeName: string, options: RouteOptions) {
    return this.resolverFn(routeName, options);
  }
}
