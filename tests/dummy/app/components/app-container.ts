import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/app-container';
import { Router, RouterState } from 'ember-constraint-router/-private/routeable';
import * as NavigationActions from 'ember-constraint-router/-private/navigation-actions';

export default class AppContainer extends Component.extend({
  classNames: 'app-container',
}) {
  layout = layout;
  routerMap: Router;
  routerState: RouterState;

  willInsertElement() {
    this.routerState = this.routerMap.getStateForAction(NavigationActions.init());
  }
};
