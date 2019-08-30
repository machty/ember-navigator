import { RouterActions } from './actions/types'
import { PublicRoute } from './public-route';

export interface RouteableState {
  key: string;
  routeName: string;
  params: any;
  componentName: string;
};

export interface RouteState extends RouteableState { }

export interface RouterState extends RouteableState {
  index: number;
  routes: RouteableState[];
};

export interface StackRouterState extends RouterState {
  headerComponentName: string;
  headerMode: string;
};

export type HandledReducerResult = {
  handled: true;
  state: RouterState;
}

export type UnhandledReducerResult = {
  handled: false;
}

export type ReducerResult = HandledReducerResult | UnhandledReducerResult;

export type InitialStateOptions = {
  key?: string;
  params?: any;
}

export interface RouteableReducer {
  name: string;
  children: RouteableReducer[];
  isRouter: boolean;
  params?: any;
  getInitialState: (options?: InitialStateOptions) => RouteableState;
  dispatch: (action: RouterActions, state?: RouteableState) => ReducerResult;
  reconcile(routerState: RouteableState, mountedNode: MountableNode) : void;
};

export interface RouteReducer extends RouteableReducer {
  isRouter: false;
  getInitialState: (options?: InitialStateOptions) => RouteState;
}

export interface RouterReducer extends RouteableReducer {
  isRouter: true;
  getInitialState: (options?: InitialStateOptions) => RouterState;
}

export interface MountableNode {
  childNodes: MountableNodeSet;
  resolver: Resolver;
  routeableState?: any;
  route: PublicRoute;
  key: string;
}

export interface Resolver {
  resolve(componentName: string): typeof PublicRoute | null;
}

export type MountableNodeSet = { [key: string]: MountableNode };

