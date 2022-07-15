import Component from '@ember/component';
import { computed } from '@ember/object';
import { NavigatorRoute } from 'ember-navigator';
import { action } from '@ember/object';

export default class EcrHeader extends Component {
  route!: NavigatorRoute;

  @computed('route.node')
  get headerConfig() {
    return this.route.node.getHeaderConfig()
  }

  classNames = ['app-header'];

  @action
  leftButton() {
    this.route.pop();
  }
};
