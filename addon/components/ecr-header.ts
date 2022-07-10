import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-header';
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
  layout = layout;

  @action
  leftButton() {
    this.route.pop();
  }
};
