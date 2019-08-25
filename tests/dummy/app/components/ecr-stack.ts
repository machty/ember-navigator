import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed } from '@ember/object';
import { Router, RouterState, RouteState } from 'ember-constraint-router/-private/routeable';
import { getOwner } from '@ember/application';

class RenderedRouteState {
  config: any;
  routeState: RouteState;
  componentName: string;

  constructor(routeState: RouteState, owner: any) {
    this.routeState = routeState;
    this.componentName = this.routeState.componentName;
    let factory = owner.factoryFor(`component:${routeState.componentName}`);
    let Config = factory && factory.class.Config;

    if (Config) {
      this.config = new Config();
    }

    debugger;
  }

  destroy() {
    if (this.config && typeof this.config.destroy === 'function') {
      this.config.destroy();
    }
  }
}

export default class EcrStack extends Component.extend({
  currentStates: computed('currentState', function() {
    return [this.currentState];
  }),

  currentState: computed('routerState', function() {
    let routerState = this.routerState as RouterState;
    let currentRouteState = routerState.routes[routerState.index];
    return this.activeRouteStates[currentRouteState.key];
  }),

  _previousRouteStates: null,
  activeRouteStates: computed('routerState', function() {
    let routerState = this.routerState as RouterState;

    let previousRouteStates: { [k: string] : RenderedRouteState } = this._previousRouteStates || {};
    let nextRouteStates: { [k: string] : RenderedRouteState } = {};

    // TODO: do this in reverse?
    routerState.routes.map(route => {
      let key = route.key;
      let routeState = previousRouteStates[key];

      if (!routeState) {
        routeState = new RenderedRouteState(route, getOwner(this));
      }

      nextRouteStates[key] = routeState;
    });

    // Destroy / evict old route states
    Object.keys(previousRouteStates).forEach(k => {
      if (nextRouteStates[k]) {
        return;
      }

      previousRouteStates[k].destroy();
    });

    return this._previousRouteStates = nextRouteStates;
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
