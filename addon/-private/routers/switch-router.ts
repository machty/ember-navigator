import * as NavigationActions from '../navigation-actions';
import { RouteableReducer, RouterReducer, RouterState, RouteState, ReducerResult, RouteableState } from '../routeable';
import { Action } from '../action';
import { BaseRouter, BaseOptions, handledAction, unhandledAction } from './base-router';

export interface SwitchOptions extends BaseOptions { }

export class SwitchRouter extends BaseRouter implements RouterReducer {
  options: SwitchOptions;

  constructor(name: string, children: RouteableReducer[], options: SwitchOptions) {
    super(name, children, options);
  }

  dispatch(action: Action, state: RouterState) {
    return unhandledAction();
  }

  getInitialState(action: Action) : RouterState {
    let childRoutes = this.children.map(c => this.resetChildRoute(c));
    return {
      key: "SwitchRouterBase",
      params: undefined,
      routeName: this.name,
      componentName: "ecr-switch",
      routes: childRoutes,
      index: 0,
      isTransitioning: false,
    };
  }

  resetChildRoute(routeable: RouteableReducer) : RouteableState {
    return routeable.getInitialState(
      NavigationActions.init()
    );
  }
}
