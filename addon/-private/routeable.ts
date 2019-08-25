import { RouterActions } from './actions/types'

export interface RouteableState {
  key: string;
  routeName: string;
  params: any;
  componentName: string;
};

export interface RouteState extends RouteableState { }

export interface RouterState extends RouteableState {
  isTransitioning: boolean;
  index: number;
  routes: RouteState[];
};

export type HandledReducerResult = {
  handled: true;
  state: RouterState;
}

export type UnhandledReducerResult = {
  handled: false;
}

export type ReducerResult = HandledReducerResult | UnhandledReducerResult;

// TODO: it seems weird to share initialization params between routes, stack routers, etc
export type InitialStateOptions = {
  key?: string;
  params?: any;
  // routeName?: string;
}

export interface RouteableReducer {
  name: string;
  children: RouteableReducer[];
  isRouter: boolean;
  params?: any;
  getInitialState: (options?: InitialStateOptions) => RouteableState;
  dispatch: (action: RouterActions, state?: RouteableState) => ReducerResult;
};

export interface RouteReducer extends RouteableReducer {
  isRouter: false;
  getInitialState: (options?: InitialStateOptions) => RouteState;
}

export interface RouterReducer extends RouteableReducer {
  isRouter: true;
  getInitialState: (options?: InitialStateOptions) => RouterState;
}
