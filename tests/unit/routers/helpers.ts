import { navigate as navigateAction } from 'ember-navigator/-private/actions/actions';

import type { NavigateParams, RouterActions } from 'ember-navigator/-private/actions/types';
import type { RouterReducer, RouterState } from 'ember-navigator/-private/routeable';

export function handle(
  router: RouterReducer,
  action: RouterActions,
  state: RouterState
): RouterState {
  let result = router.dispatch(action, state);

  if (!result.handled) {
    throw new Error('expected handled action');
  }

  return result.state;
}

export function navigate(
  router: RouterReducer,
  state: RouterState,
  params: NavigateParams
): RouterState {
  let action = navigateAction(typeof params === 'string' ? { routeName: params } : params);

  return handle(router, action, state);
}
