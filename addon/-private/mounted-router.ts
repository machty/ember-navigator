import EmberObject, { set } from "@ember/object";
import { Router, RouterState } from "./routeable";
import { init, navigate } from 'ember-constraint-router/-private/navigation-actions';
import { Action } from "./action";

export default class MountedRouter {
  router: Router;
  state: RouterState;
  constructor(router: Router) {
    this.router = router;
    this.state = router.getInitialState(init());
  }

  dispatch(action: Action) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      // TODO: dispatch events?
      set(this, 'state', result.state);
    }
  }

  navigate(options) {
    this.dispatch(navigate(options));
  }
}
