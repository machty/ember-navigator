import Component from '@glimmer/component';
import { action } from '@ember/object';

import type { MountedNode } from 'ember-navigator/-private/mounted-node';
import type NavigatorRoute from 'ember-navigator/-private/navigator-route';

interface Args {
  node: MountedNode;
  route: NavigatorRoute;
}

export default class EcrHeader extends Component<Args> {
  get headerConfig() {
    return this.args.node.getHeaderConfig();
  }

  get route() {
    return this.args.node.route;
  }

  @action
  leftButton() {
    this.args.route.pop();
  }
}
