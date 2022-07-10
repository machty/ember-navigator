import Component from "@ember/component";
// @ts-ignore: Ignore import of compiled template
import layout from "../templates/components/ecr-stack";
import { computed } from "@ember/object";
import { RouterState } from "ember-navigator/-private/routeable";
import { MountedNode } from "ember-navigator/-private/mounted-node";

export default class EcrStack extends Component {
  layout = layout;
  // tagName = null;
  classNames = ["ecr-stack"]
  node!: MountedNode

  constructor() {
    this.tagName = ''
    super()
  }

  @computed("route.node")
  get currentNodes() {
    let routerState = this.node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = this.node.childNodes[activeChild.key];
    return [activeChildNode];
  }

  @computed()
  get showHeader() {
    return this.node.routeableState.headerMode !== "none";
  }

  @computed()
  get headerComponentName() {
    return this.node.routeableState.headerComponentName;
  }
}
