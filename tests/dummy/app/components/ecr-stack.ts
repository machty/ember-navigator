import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed, set } from '@ember/object';
import { RouterReducer, RouterState, RouteState } from 'ember-constraint-router/-private/routeable';
import { setOwner, getOwner } from '@ember/application';

class RenderedRouteState {
  config: any;
  routeState: RouteState;
  componentName: string;
  updateConfig: boolean;
  setState(_state: RouteState) : void { }

  constructor(routeState: RouteState, owner: any) {
    this.routeState = routeState;
    this.componentName = this.routeState.componentName;
    let factory = owner.factoryFor(`component:${routeState.componentName}`);
    let Config = factory && factory.class.Config;

    if (Config) {
      if (typeof Config === 'object') {
        this.config = { ...Config };
        this.updateConfig = false;
      } else {
        if (typeof Config.create === 'function') {
          this.config = Config.create({ state: routeState });
        } else {
          this.config = new Config(routeState);
        }
        this.setState = (state: RouteState) => set(this.config, 'state', state);
        setOwner(this.config, owner);
        this.updateConfig = true;
      }
    }
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

  currentState: computed('state', function() {
    let state = this.state as RouterState;
    let currentRouteState = state.routes[state.index];
    return this.activeRouteStates[currentRouteState.key];
  }),

  _previousRouteStates: null,
  activeRouteStates: computed('state', function() {
    let state = this.state as RouterState;

    let previousRouteStates: { [k: string] : RenderedRouteState } = this._previousRouteStates || {};
    let nextRouteStates: { [k: string] : RenderedRouteState } = {};

    // TODO: do this in reverse?
    state.routes.map(route => {
      let key = route.key;
      let routeState = previousRouteStates[key];

      if (routeState) {
        routeState.setState(route);
      } else {
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
  routerMap: RouterReducer;
  state: RouterState;
};
