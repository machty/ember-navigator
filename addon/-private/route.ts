import { RouteReducer, RouteableReducer, RouteState } from './routeable';
import { Action } from './action';
import { generateKey } from './key-generator';

export type RouteOptions = {
  componentName?: string;
}

export class Route implements RouteReducer {
  name: string;
  children: RouteableReducer[];
  options: RouteOptions;
  isRouter: false;
  componentName: string;

  constructor(name: string, options: RouteOptions) {
    this.isRouter = false;
    this.name = name;
    this.children = [];
    this.options = options;
    this.componentName = options.componentName || name;
  }

  getInitialState(action: Action) : RouteState {
    // TODO: the typing is weird/flimsy here; all fields except type are optional on Action
    let routeName = action.routeName;
    return {
      params: action.params,
      routeName,
      key: action.key || generateKey(),
      componentName: routeName,
    };
  }
}
