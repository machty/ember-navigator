import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-header';
import { computed } from '@ember/object';
import { NavigatorRoute } from 'ember-navigator';

export default class EcrHeader extends Component.extend({
  route: NavigatorRoute,

  headerConfig: computed('route.node', function() {
    let node = this.route.node;
    return node.getHeaderConfig();
  }),

  actions: {
    leftButton() {
      this.route.pop();
    }
  }
}) {
  classNames = ['app-header'];
  layout = layout;
};
