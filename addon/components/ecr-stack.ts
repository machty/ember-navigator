import Component from '@glimmer/component';

import type { MountedNode } from 'ember-navigator/-private/mounted-node';
import type { RouterState } from 'ember-navigator/-private/routeable';

interface Args {
  node: MountedNode;
}

export default class EcrStack extends Component<Args> {
  classNames = ['ecr-stack'];
  node!: MountedNode;

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
