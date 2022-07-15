import EcrRouterComponent from './ecr-router-component';

import type { RouterState } from 'ember-navigator/-private/routeable';

export default class EcrSwitch extends EcrRouterComponent {
  state?: RouterState;

  get currentNodes() {
    let node = this.args.node;
    let routerState = node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = node.childNodes[activeChild.key];

    return [activeChildNode];
  }
}
