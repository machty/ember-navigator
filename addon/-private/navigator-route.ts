import { MountableNode } from "./routeable";
import { notifyPropertyChange } from "@ember/object";
import { NavigateParams, PopParams } from "./actions/types";

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
    notifyPropertyChange(this, 'node')
  }

  get params() {
    return this.node.params || {};
  }

  unmount() {}
  mount() {}
  focus() {}
  blur() {}
}
