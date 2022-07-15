import Component from '@glimmer/component';
import { computed } from '@ember/object';

import type { MountedNode } from 'ember-navigator/-private/mounted-node';
import type { RouterState } from 'ember-navigator/-private/routeable';

export default class EcrStack extends Component {
  classNames = ['ecr-stack'];
  node!: MountedNode;

  @computed('args.node.{childNodes,routeableState}', 'args.route.node')
  get currentNodes() {
    let routerState = this.args.node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = this.args.node.childNodes[activeChild.key];

    return [activeChildNode];
  }

  @computed('args.node.routeableState.headerMode')
  get showHeader() {
    return this.args.node.routeableState.headerMode !== 'none';
  }

  @computed('args.node.routeableState.headerComponentName')
  get headerComponentName() {
    return this.args.node.routeableState.headerComponentName;
  }
}
