import { Action } from './action';

// Action constants
export const BACK = 'Navigation/BACK';
export const INIT = 'Navigation/INIT';
export const NAVIGATE = 'Navigation/NAVIGATE';
export const SET_PARAMS = 'Navigation/SET_PARAMS';

// Action creators
export const back = (payload: any = {}) => ({
  type: BACK,
  key: payload.key,
  immediate: payload.immediate,
});

export const init = (payload: any = {}) => {
  const action: Action = {
    type: INIT,
  };
  if (payload.params) {
    action.params = payload.params;
  }
  return action;
};

export const navigate = payload => {
  const action: Action = {
    type: NAVIGATE,
    routeName: payload.routeName,
  };
  if (payload.params) {
    action.params = payload.params;
  }
  if (payload.action) {
    action.action = payload.action;
  }
  if (payload.key) {
    action.key = payload.key;
  }
  return action;
};

export const setParams = payload => ({
  type: SET_PARAMS,
  key: payload.key,
  params: payload.params,
  preserveFocus: true,
});
