import * as NavigationActions from '../navigation-actions';
import * as StackActions from '../stack-actions';
import { Routeable, Router, RouterState, RouteState } from '../routeable';
import { Action } from '../action';
import { generateKey } from '../key-generator';
import Route from '@ember/routing/route';

export type StackOptions = {
  componentName?: string;
}

export class StackRouter implements Router {
  name: string;
  children: Routeable[];
  options: StackOptions;
  componentName: string;
  isRouter: true;
  childRouters: { [k: string]: Router };
  routeNames: string[];

  constructor(name: string, children: Routeable[], options: StackOptions) {
    this.isRouter = true;
    this.name = name;
    this.children = children;
    this.options = options;

    this.childRouters = {};
    this.routeNames = [];
    children.forEach(c => {
      if (c.isRouter) {
        this.childRouters[c.name] = c as Router;
      }
      this.routeNames.push(c.name);
    });

    this.componentName = this.options.componentName || "ecr-stack";
  }

  getStateForAction(action: Action, state: any) {
    return this.getInitialState(action);

    /*
    if (!state) {
    }

    return {
      key: 'StackRouterRoot',
      routeName: this.name,
      params: action.params,
      isTransitioning: false,
      componentName: this.componentName,
      index: 0,
      routes: [
        {
          params: action.params,
          // ...childState,
          
          key: action.key || generateKey(),
          routeName: action.routeName,
        },
      ],
    };
    */
  }

  getInitialState(action: Action) : RouterState {
    const initialRouteName = this.routeNames[0];
    // const initialChildRouter = childRouters[initialRouteName];

    // TODO: make this configurable via config.initialRouteName
    let initialChildRouter = this.childRouters[initialRouteName];
    let route = {} as RouteState;

    if (initialChildRouter) {
      route = initialChildRouter.getStateForAction(
        NavigationActions.navigate({
          routeName: initialRouteName,
          // TODO: initialRouteParams
          params: null
        })
      );
    }

    // TODO: flesh out all the ways to merge params.
    const params = {};

    route = {
      ...route,
      params,
      routeName: initialRouteName,
      key: action.key || generateKey(),

      // TODO: shouldn't we check the route config for this? RN doesn't because it doesn't have route config
      componentName: initialRouteName,
    };

    // QUESTION
    return {
      key: 'StackRouterRoot',
      isTransitioning: false,
      index: 0,
      routes: [ route ],
      componentName: this.componentName,

      // TODO: in RN, the root stack navigator doesn't have params/routeName; are we doing it wrong?
      params: {},
      routeName: this.name,
    };
  }
}
