export const BACK = "Navigation/BACK";
export const INIT = "Navigation/INIT";
export const NAVIGATE = "Navigation/NAVIGATE";
export const SET_PARAMS = "Navigation/SET_PARAMS";
export const POP = "Navigation/POP";
export const POP_TO_TOP = "Navigation/POP_TO_TOP";
export const PUSH = "Navigation/PUSH";
export const RESET = "Navigation/RESET";
export const REPLACE = "Navigation/REPLACE";

export type BackParams = {
  key?: string;
};

export type BackAction = {
  type: typeof BACK;
  payload: BackParams;
};

export type InitParams = {
  params?: any;
};

export type InitAction = {
  type: typeof INIT;
  payload: InitParams;
};

export type NavigateParams = {
  routeName: string;
  params?: any;
  action?: RouterActions;
  key?: string;
};

export type NavigateAction = {
  type: typeof NAVIGATE;
  payload: NavigateParams;
};

export type SetParamsParams = {
  key?: string;
  params?: any;
  preserveFocus: boolean;
};

export type SetParamsAction = {
  type: typeof SET_PARAMS;
  payload: SetParamsParams;
};

export type PopParams = {
  n?: number;
};

export type PopAction = {
  type: typeof POP;
  payload: PopParams;
};

export type PopToTopAction = {
  type: typeof POP_TO_TOP;
};

export type PushParams = {
  routeName: string;
  params?: any;
  action?: RouterActions;
};

export type PushAction = {
  type: typeof PUSH;
  payload: PushParams;
};

export type ResetParams = {
  index: number;
  actions: RouterActions[];
  key?: string | null;
};

export type ResetAction = {
  type: typeof RESET;
  payload: ResetParams;
};

export type ReplaceParams = {
  key?: string;
  newKey?: string;
  routeName?: string;
  params?: object;
  action?: RouterActions;
};

export type ReplaceAction = {
  type: typeof REPLACE;
  payload: ReplaceParams;
};

export type NavigationActions = NavigateAction | BackAction | SetParamsAction | InitAction;
export type StackActions = ResetAction | ReplaceAction | PushAction | PopAction | PopToTopAction;
export type RouterActions = NavigationActions | StackActions;
