import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { action } from '@ember/object';

import type { NavigatorRoute } from 'ember-navigator';

export default class EcrHeader extends Component {
  route!: NavigatorRoute;

  @computed('args.route.node')
  get headerConfig() {
    return this.args.route.node.getHeaderConfig();
  }

  @action
  leftButton() {
    this.args.route.pop();
  }
}
