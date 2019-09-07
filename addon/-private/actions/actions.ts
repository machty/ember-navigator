import {
  InitAction,
  InitParams,
  INIT,
  NAVIGATE,
  SET_PARAMS,
  BACK,
  NavigateParams,
  NavigateAction,
  BackAction,
  BackParams,
  SetParamsParams,
  PopParams,
  POP,
  PopAction,
  POP_TO_TOP,
  PUSH,
  PushParams,
  PushAction,
  RESET,
  ResetParams,
  ResetAction,
  REPLACE,
  ReplaceParams,
  ReplaceAction,
  SetParamsAction,
  BatchParams,
  BatchAction,
  BATCH
} from "./types";

export const back = (payload: BackParams = {}): BackAction => ({
  type: BACK,
  payload
});

export const init = (payload: InitParams): InitAction => {
  return { type: INIT, payload };
};

export const navigate = (payload: NavigateParams): NavigateAction => {
  return { type: NAVIGATE, payload };
};

export const setParams = (payload: SetParamsParams): SetParamsAction => ({
  type: SET_PARAMS,
  payload
});

export const pop = (payload: PopParams = {}): PopAction => ({
  type: POP,
  payload
});

export const popToTop = () => ({ type: POP_TO_TOP });

export const push = (payload: PushParams): PushAction => ({
  type: PUSH,
  payload
});

export const reset = (payload: ResetParams): ResetAction => ({
  type: RESET,
  payload
});

export const replace = (payload: ReplaceParams): ReplaceAction => ({
  type: REPLACE,
  payload
});

export const batch = (payload: BatchParams): BatchAction => ({
  type: BATCH,
  payload
});
