import { MountableNode } from "./routeable";
import { notifyPropertyChange } from "@ember/object";
import { NavigateParams, PopParams } from "./actions/types";

export class PublicRoute {
  node: MountableNode;

  constructor(node: MountableNode) {
    this.node = node;
  }

  navigate(options: NavigateParams) {
    (this.node as any).mountedRouter.navigate(options);
  }

  pop(options: PopParams) {
    (this.node as any).mountedRouter.pop(options);
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
  didNavigate(_params: any) {}
}
