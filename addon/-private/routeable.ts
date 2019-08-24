import { Action } from './action';

export interface RouteableState {
  key: string;
  routeName: string;
  params: object;
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
  componentName: string;
  isRouter: boolean;
};

export interface Router extends Routeable {
  isRouter: true;
  getStateForAction: (action: Action, state?: any) => RouteableState;
}
