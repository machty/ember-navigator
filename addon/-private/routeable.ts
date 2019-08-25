import { Action } from './action';

export interface RouteableState {
  key: string;
  routeName: string;
  params: object;
  componentName: string;
};

export interface RouteState extends RouteableState {
  key: string;
}

export interface RouterState extends RouteableState {
  isTransitioning: boolean;
  index: number;
  routes: RouteState[];
};

export interface Routeable {
  name: string;
  children: Routeable[];
  componentName: string; // TODO: remove?
  isRouter: boolean;
  params?: object;
};

export type HandledReducerResult = {
  handled: true;
  state: RouterState;
}

export type UnhandledReducerResult = {
  handled: false;
}

export type ReducerResult = HandledReducerResult | UnhandledReducerResult;

export interface Router extends Routeable {
  isRouter: true;
  getStateForAction: (action: Action, state?: any) => ReducerResult;
}
