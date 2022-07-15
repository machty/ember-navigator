import Component from '@glimmer/component';

import type { MountedNode } from 'ember-navigator/-private/mounted-node';

interface Args {
  node: MountedNode;
}

export default abstract class EcrRouterComponent extends Component<Args> {
  abstract get currentNodes(): MountedNode[];

  get node() {
    return this.args.node;
  }

  get route() {
    return this.node.route;
  }
}
