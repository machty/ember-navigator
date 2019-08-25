import * as NavigationActions from '../navigation-actions';
import * as StackActions from '../stack-actions';
import { Routeable, Router, RouterState, RouteState, ReducerResult } from '../routeable';
import { Action } from '../action';
import { generateKey } from '../key-generator';
import StateUtils from '../utils/state';
import invariant from '../utils/invariant';

export type StackOptions = {
  componentName?: string;
}

function behavesLikePushAction(action) {
  return (
    action.type === NavigationActions.NAVIGATE ||
    action.type === StackActions.PUSH
  );
}

function handledAction(state) : ReducerResult {
  return { handled: true, state };
}

function unhandledAction(state) : ReducerResult {
  return { handled: false };
}

export class StackRouter implements Router {
  name: string;
  children: Routeable[];
  options: StackOptions;
  componentName: string;
  isRouter: true;
  childRouteables: { [k: string]: Routeable };
  routeNames: string[];

  constructor(name: string, children: Routeable[], options: StackOptions) {
    this.isRouter = true;
    this.name = name;
    this.children = children;
    this.options = options;
    this.routeNames = [];
    this.childRouteables = {};


    children.forEach(c => {
      this.childRouteables[c.name] = c;
      this.routeNames.push(c.name);
    });

    this.componentName = this.options.componentName || "ecr-stack";
  }

  navigateToPreexisting(action: Action, state: RouterState) : ReducerResult | void {
    if (!this.childRouteables[action.routeName]) {
      return;
    }

    const lastRouteIndex = state.routes.findIndex(r => {
      if (action.key) {
        return r.key === action.key;
      } else {
        return r.routeName === action.routeName;
      }
    });

    if (lastRouteIndex === -1) {
      return;
    }

    // If index is unchanged and params are not being set, leave state identity intact
    if (state.index === lastRouteIndex && !action.params) {
      return handledAction(state);
    }

    // Remove the now unused routes at the tail of the routes array
    const routes = state.routes.slice(0, lastRouteIndex + 1);

    // Apply params if provided, otherwise leave route identity intact
    if (action.params) {
      const route = state.routes[lastRouteIndex];
      routes[lastRouteIndex] = {
        ...route,
        params: {
          ...route.params,
          ...action.params,
        },
      };
    }
    // Return state with new index. Change isTransitioning only if index has changed
    return handledAction({
      ...state,
      isTransitioning:
        state.index !== lastRouteIndex
          ? action.immediate !== true
          : state.isTransitioning,
      index: lastRouteIndex,
      routes,
    });
  }

  navigateToNew(action: Action, state: RouterState) : ReducerResult | void {
    // let childRouter = this.childRouterNamed(action.routeName)
    let routeable = this.childRouteables[action.routeName]

    let route;
    if (routeable.isRouter) {
      // Delegate to the child router with the given action, or init it
      let childRouter = routeable as Router;

      const childAction =
        action.action ||
        NavigationActions.init({
          params: this.getParamsForRouteAndAction(action.routeName, action),
        });
      route = {
        params: this.getParamsForRouteAndAction(action.routeName, action),
        // note(brentvatne): does it make sense to wipe out the params
        // here? or even to add params at all? need more info about what
        // this solves
        ...childRouter.dispatch(childAction),
        routeName: action.routeName,
        key: action.key || generateKey(),
      };
    } else {
      // Create the route from scratch
      route = {
        params: this.getParamsForRouteAndAction(action.routeName, action),
        routeName: action.routeName,
        componentName: action.routeName, // TODO: this seems wrong; also how come no type errors when commented out?
        key: action.key || generateKey(),
      };
    }

    return handledAction({
      ...StateUtils.push(state, route),
      isTransitioning: action.immediate !== true,
    });
  }

  getParamsForRouteAndAction(routeName, action) {
    let routeConfig = this.childRouteables[routeName];
    if (routeConfig && routeConfig.params) {
      return { ...routeConfig.params, ...action.params };
    } else {
      return action.params;
    }
  }

  dispatch(action: Action, state: RouterState) {
    if (action.type === NavigationActions.NAVIGATE) {
      let nextRouteState = this.delegateNavigationToActiveChildRouters(action, state) ||
                           this.navigateToPreexisting(action, state) ||
                           this.navigateToNew(action, state);

      if (nextRouteState) {
        return nextRouteState;
      }
    }

    if (action.type === StackActions.PUSH) {
      invariant(action.key == null, 'StackRouter does not support key on the push action');
    }

    if (
      action.type === NavigationActions.BACK ||
      action.type === StackActions.POP
    ) {
      let nextRouteState = this.popStack(action, state);
      if (nextRouteState) {
        return nextRouteState;
      }
    }

    return handledAction(this.getInitialState(action))
  }

  popStack(action: Action, state: RouterState) : ReducerResult | void {
    const { key, n, immediate } = action;
    let backRouteIndex = state.index;
    if (action.type === StackActions.POP && n != null) {
      // determine the index to go back *from*. In this case, n=1 means to go
      // back from state.index, as if it were a normal "BACK" action
      backRouteIndex = Math.max(1, state.index - n + 1);
    } else if (key) {
      const backRoute = state.routes.find(route => route.key === key);
      backRouteIndex = backRoute ? state.routes.indexOf(backRoute) : -1;
    }

    if (backRouteIndex > 0) {
      return handledAction({
        ...state,
        routes: state.routes.slice(0, backRouteIndex),
        index: backRouteIndex - 1,
        isTransitioning: immediate !== true,
      });
    }
  }

  childRouterNamed(name: string) : Router | null {
    let child = this.childRouteables[name];
    return child.isRouter ? child as Router : null;
  }

  delegateNavigationToActiveChildRouters(action: Action, state: RouterState) : ReducerResult | void {
    // Traverse routes from the top of the stack to the bottom, so the
    // active route has the first opportunity, then the one before it, etc.
    for (let childRoute of state.routes.slice().reverse()) {
      let childRouter = this.childRouterNamed(childRoute.routeName);
      if (!childRouter) {
        continue;
      }

      let childAction =
        action.routeName === childRoute.routeName && action.action
          ? action.action
          : action;

      const result = childRouter.dispatch(
        childAction,
        childRoute
      );

      if (!result.handled) {
        continue;
      }

      let nextRouteState = result.state;

      const newState = StateUtils.replaceAndPrune(
        state,
        nextRouteState.key,
        nextRouteState
      );

      throw new Error("testme");
      return handledAction({
        ...newState,
        isTransitioning:
          state.index !== newState.index
            ? action.immediate !== true
            : state.isTransitioning,
      });
    }
  }

  getInitialState(action: Action) : RouterState {
    const initialRouteName = this.routeNames[0];

    // TODO: make this configurable via config.initialRouteName
    let initialChildRouter = this.childRouterNamed(initialRouteName);
    let route = {} as RouteState;

    if (initialChildRouter) {
      route = initialChildRouter.getInitialState(
        NavigationActions.navigate({
          routeName: initialRouteName,
          // TODO: initialRouteParams
          params: null
        })
      )
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
