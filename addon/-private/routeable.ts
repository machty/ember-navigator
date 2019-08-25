import { Action } from './action';

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

export interface RouteableReducer {
  name: string;
  children: RouteableReducer[];
  isRouter: boolean;
  params?: any;
  getInitialState: (action: Action) => RouteableState;
};

export interface RouteReducer extends RouteableReducer {
  isRouter: false;
  getInitialState: (action: Action) => RouteState;
}

export interface RouterReducer extends RouteableReducer {
  isRouter: true;
  dispatch: (action: Action, state?: any) => ReducerResult;
  getInitialState: (action: Action) => RouterState;
}
