import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-header';
import { computed } from '@ember/object';
import { MountedNode } from 'ember-constraint-router/-private/mounted-router';

export default class EcrHeader extends Component.extend({
  mountedRouter: null,

  headerConfig: computed('route.node', function() {
    let node = this.route.node as MountedNode;
    return node.getHeaderConfig();
  }),

  actions: {
    leftButton() {
      (this as any).mountedRouter.pop();
    }
  }
}) {
  classNames = ['app-header'];  
  layout = layout;
};
