import Component from '@glimmer/component';
import { computed } from '@ember/object';

import type { MountedNode } from 'ember-navigator/-private/mounted-node';
import type { RouterState } from 'ember-navigator/-private/routeable';

export default class EcrSwitch extends Component {
  state?: RouterState;

  @computed('args.node', 'args.route.node')
  get currentNodes() {
    let node = this.args.node as MountedNode;
    let routerState = node.routeableState as RouterState;
    let activeChild = routerState.routes[routerState.index];
    let activeChildNode = node.childNodes[activeChild.key];

    return [activeChildNode];
  }
}
