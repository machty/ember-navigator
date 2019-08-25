import { setOwner } from '@ember/application';
import { set } from "@ember/object";
import { RouteState, RouterState } from './routeable'

export class RenderedRouteState {
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

export type RenderedRouteStateSet = {
  [k: string] : RenderedRouteState ;
}

export function recomputeStateSet(state: RouterState, owner: any, previousRouteStates: RenderedRouteStateSet) : RenderedRouteStateSet {
  let nextRouteStates: RenderedRouteStateSet = {};

  // TODO: do this in reverse?
  state.routes.map(route => {
    let key = route.key;
    let routeState = previousRouteStates[key];

    if (routeState) {
      routeState.setState(route);
    } else {
      routeState = new RenderedRouteState(route, owner);
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

  return nextRouteStates;
}
