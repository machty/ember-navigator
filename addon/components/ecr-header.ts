import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { NavigatorRoute } from 'ember-navigator';
import { action } from '@ember/object';

export default class EcrHeader extends Component {
  route!: NavigatorRoute;

  @computed('args.route.node')
  get headerConfig() {
    return this.args.route.node.getHeaderConfig()
  }

  @action
  leftButton() {
    this.args.route.pop();
  }
};
