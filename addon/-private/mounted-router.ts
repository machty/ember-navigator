import { RouterReducer, RouterState, Resolver } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";
import { set } from "@ember/object";
import { sendEvent } from '@ember/object/events';
import { MountedNode } from "./mounted-node";

export default class MountedRouter {
  router: RouterReducer;
  state: RouterState;
  resolver: Resolver;
  rootNode: MountedNode;

  constructor(router: RouterReducer, resolver: Resolver) {
    this.resolver = resolver;
    this.router = router;
    this.state = router.getInitialState();
    this.rootNode = new MountedNode(this, null, this.state);
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
