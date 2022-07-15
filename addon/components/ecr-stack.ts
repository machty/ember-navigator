import EcrRouterComponent from './ecr-router-component';

import type { RouterState } from 'ember-navigator/-private/routeable';

export default class EcrStack extends EcrRouterComponent {
  get currentNodes() {
    let routerState = this.args.node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = this.args.node.childNodes[activeChild.key];

    return [activeChildNode];
  }

  get showHeader() {
    return this.args.node.routeableState.headerMode !== 'none';
  }

  get headerComponentName() {
    return this.args.node.routeableState.headerComponentName;
  }
}
