import { notifyPropertyChange } from "@ember/object";

import type { NavigateParams, PopParams } from "./actions/types";
import type { MountedNode } from "./mounted-node";
import type {
  BaseResolveResult,
  BaseRouteOptions,
  RouteableState,
} from "./routeable";

export type Header = {
  title?: string;
};

export type NavigatorRouteConstructorParams<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult
> = [node: MountedNode<RouteOptions, ResolveResult>];

/**
 * NavigatorRoute is part of the public API of ember-navigator; it is a class
 * that is meant to be subclassed with various lifecycle hooks that can be
 * overridden in the subclass.
 */
export default class NavigatorRoute<
  RouteOptions extends BaseRouteOptions,
  ResolveResult extends BaseResolveResult
> {
  node: MountedNode<RouteOptions, ResolveResult>;
  header?: Header;

  /**
   * Constructs a NavigatorRoute, which you can override in your NavigatorRoute subclasses
   * to load data or perform other operations when the route is mounted.
   *
   * @param params NavigatorRouteConstructorParams
   */
  constructor(
    ...params: NavigatorRouteConstructorParams<RouteOptions, ResolveResult>
  ) {
    this.node = params[0];
  }

  static create<
    RouteOptions extends BaseRouteOptions,
    ResolveResult extends BaseResolveResult
  >(props: { node: MountedNode<RouteOptions, ResolveResult> }) {
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

  update(_state: RouteableState) {
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
   * Returns the navigation key that uniquely identifies the route within a router tree;
   * this is a value that is either passed in as an option to `navigate()`, or is
   * auto-generated if no such value is passed to `navigate()`
   */
  get key() {
    return this.node.key;
  }

  /**
   * Returns the name of this route as specified in the mapping DSL (e.g. `route('foo')`)
   */
  get name() {
    return this.node.routeName;
  }

  /**
   * Returns the immediate parent route or router. For example, if this is the 3rd route
   * within a stack router, `parent()` will return the 2nd NavigatorRoute in the stack.
   */
  get parent(): NavigatorRoute<RouteOptions, ResolveResult> | null {
    const parentNode = this.node.parentNode;

    if (!parentNode) {
      return null;
    }

    return (parentNode as MountedNode<RouteOptions, ResolveResult>).route;
  }

  /**
   * Returns the closest parent of the provided name.
   */
  parentNamed(name: string): NavigatorRoute<RouteOptions, ResolveResult> | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: NavigatorRoute<RouteOptions, ResolveResult> | null = this;

    while (cur && cur.name !== name) {
      cur = cur.parent;
    }

    return cur;
  }

  /**
   * Returns the nearest parent router, e.g. the stack router that this route is mounted in.
   */
  get parentRouter(): NavigatorRoute<RouteOptions, ResolveResult> | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: NavigatorRoute<RouteOptions, ResolveResult> | null = this;

    while (cur && !(cur.node as MountedNode<RouteOptions, ResolveResult>).isRouter) {
      cur = cur.parent;
    }

    return cur;
  }

  /**
   * Returns the parent route, and null if there is no parent, or the parent is a router.
   */
  get parentRoute(): NavigatorRoute<RouteOptions, ResolveResult> | null {
    const parent = this.parent;

    if (!parent) {
      return null;
    }

    if ((parent.node as MountedNode<RouteOptions, ResolveResult>).isRouter) {
      return null;
    } else {
      return parent;
    }
  }

  // Public overridable hooks:

  /**
   * `mount` is called after transitioning to a new route, or pushing a stack frame;
   * Within this hook, you can access `this.params` to access any params passed into
   * this route (such as model IDs or any other information)
   *
   * There is no difference between overriding this method vs just overriding the
   * NavigatorRoute constructor (and calling super()), but overriding the constructor
   * tends to be the happier path when working with TypeScript
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mount() {}

  /**
   * `unmount` is called after the route has been removed from the routing tree.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unmount() {}
}
