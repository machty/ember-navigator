import { Action } from './action';

export type RouteState = {
  params: object;
  key: string;
  routeName: string;
}

export type RouterState = {
  key: string;
  isTransitioning: boolean;
  index: number;
  routes: RouteState[];
};

export type Routeable = {
  name: string;
  children: Routeable[];
  componentName: string;
  getStateForAction: (action: Action, state: any) => RouterState;
};
