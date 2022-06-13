import { MountableNode } from "./routeable";
import { notifyPropertyChange } from "@ember/object";
import { NavigateParams, PopParams } from "./actions/types";

/**
 * NavigatorRoute is part of the public API of ember-navigator; it is a class
 * that is meant to be subclassed with various lifecycle hooks that can be
 * overridden in the subclass.
 */
export default class NavigatorRoute {
  node: MountableNode;

  constructor(node: MountableNode) {
    this.node = node;
  }

  static create(props: { node: MountableNode }) {
    let instance = new this(props.node);
    Object.assign(instance, props);
    return instance;
  }

  navigate(options: NavigateParams) {
    this.node.mountedRouter.navigate(options);
  }

  pop(options?: PopParams) {
    this.node.mountedRouter.pop(options);
  }

  update(_state: any) {
    // this is how we signal to components to re-render with the new state.
    notifyPropertyChange(this, "node");
  }

  /**
   * Returns the params hash passed to this route (mostly via the `navigate()` method)
   */
  get params() {
    return this.node.params || {};
  }

  /**
   * Returns the name of this route as specified in the mapping DSL (e.g. `route('foo')`)
   */
  get name() {
    return this.node.routeName;
  }

  get parentRoute() {
    // return this.node.params || {};
    return null;
  }

  // Public overridable hooks:

  /**
   * `mount` is called after transitioning to a new route, or pushing a stack frame;
   * Within this hook, you can access `this.params` to access any params passed into
   * this route (such as model IDs or any other information)
   */
  mount() {}

  /**
   * `unmount` is called after the route has been removed from the routing tree.
   */
  unmount() {}
}
