import { MountableNode } from "./routeable";
import { notifyPropertyChange } from "@ember/object";

export class PublicRoute {
  node: MountableNode;
  constructor(node: MountableNode) {
    this.node = node;
  }

  navigate(options: NavigateParams) {
  }

  pop(options: PopParams) {
    // this.dispatch(pop(options));
  }


  update(state: any) {
    // this is how we signal to components to re-render with the new state.
    notifyPropertyChange(this, 'node')
  }

  unmount() {}
  mount() {}
  focus() {}
  blur() {}
}
