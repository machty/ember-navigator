import { MountableNode } from "./routeable";

export class PublicRoute {
  node: MountableNode;
  constructor(node: MountableNode) {
    this.node = node;
  }

  navigate(options: NavigateParams) {
    debugger;
  }

  pop(options: PopParams) {
    // this.dispatch(pop(options));
  }

  update(state: any) {}
  unmount() {}
  mount() {}
  focus() {}
  blur() {}
}
