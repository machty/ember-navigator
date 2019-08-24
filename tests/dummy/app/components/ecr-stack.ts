import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed } from '@ember/object';
import { Router, RouterState } from 'ember-constraint-router/-private/routeable';

export default class EcrStack extends Component.extend({
  visibleFrames: computed('routerState', function() {
    let routerState = this.routerState as RouterState;
    return [routerState.routes[routerState.index]];
  }),

  actions: {
    goBack() {
      alert('goBack')
      // this.navStack.goBack();
    }
  }
}) {
  layout = layout;
  routerMap: Router;
  routerState: RouterState;
};
