import { MountableNode } from "./routeable";
import { notifyPropertyChange, set } from "@ember/object";
import { NavigateParams, PopParams } from "./actions/types";

export class PublicRoute {
  node: MountableNode;
  params: any;

  constructor(node: MountableNode) {
    this.node = node;
  }

  navigate(options: NavigateParams) {
    (this.node as any).mountedRouter.navigate(options);
  }

  pop(options: PopParams) {
    (this.node as any).mountedRouter.pop(options);
  }

  update(state: any) {
    set(this, 'params', state.params);
    // this is how we signal to components to re-render with the new state.
    notifyPropertyChange(this, 'node')
  }

  unmount() {}
  mount() {}
  focus() {}
  blur() {}
}
