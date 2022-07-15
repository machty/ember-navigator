import Component from "@glimmer/component";
import { computed } from "@ember/object";
import { RouterState } from "ember-navigator/-private/routeable";
import { MountedNode } from "ember-navigator/-private/mounted-node";

export default class EcrStack extends Component {
  classNames = ["ecr-stack"]
  node!: MountedNode

  @computed("route.node")
  get currentNodes() {
    let routerState = this.args.node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = this.args.node.childNodes[activeChild.key];
    return [activeChildNode];
  }

  @computed()
  get showHeader() {
    return this.args.node.routeableState.headerMode !== "none";
  }

  @computed()
  get headerComponentName() {
    return this.args.node.routeableState.headerComponentName;
  }
}
