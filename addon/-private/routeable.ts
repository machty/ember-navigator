import type { RouterActions } from './actions/types';
import type { MountedNode } from './mounted-node';
import type NavigatorRoute from './navigator-route';

export interface RouteableState {
  key: string;
  routeName: string;
  params: Record<string, unknown>;
  componentName: string;

  // TODO: consider getting rid of these? Do any apps in the wild use these?
  headerComponentName?: string;
  headerMode?: string;
}

export type RouteState = RouteableState;

export interface RouterState extends RouteableState {
  index: number;
  routes: RouteableState[];
}

export interface StackRouterState extends RouterState {
  headerComponentName: string;
  headerMode: string;
}

export type HandledReducerResult = {
  handled: true;
  state: RouterState;
};

export type UnhandledReducerResult = {
  handled: false;
};

export type ReducerResult = HandledReducerResult | UnhandledReducerResult;

export type InitialStateOptions = {
  key?: string;
  params?: Record<string, unknown>;
};

export interface RouteableReducer {
  name: string;
  children: RouteableReducer[];
  isRouter: boolean;
  params?: Record<string, unknown>;
  getInitialState: (options?: InitialStateOptions) => RouteableState;
  dispatch: (action: RouterActions, state?: RouteableState) => ReducerResult;
  reconcile(routerState: RouteableState, mountedNode: MountedNode): void;
}

export interface RouterReducer extends RouteableReducer {
  isRouter: true;
  getInitialState: (options?: InitialStateOptions) => RouterState;
}

export interface Resolver {
  resolve(componentName: string): typeof NavigatorRoute | null;
}
