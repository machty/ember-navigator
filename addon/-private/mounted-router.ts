import { set } from "@ember/object";
import { RouterReducer, RouterState } from "./routeable";
import { RouterActions } from "./actions/types";
import { navigate, pop } from "./actions/actions";

export default class MountedRouter {
  router: RouterReducer;
  state: RouterState;
  constructor(router: RouterReducer) {
    this.router = router;
    this.state = router.getInitialState();
  }

  dispatch(action: RouterActions) {
    let result = this.router.dispatch(action, this.state);
    if (result.handled) {
      // TODO: dispatch events?
      set(this, 'state', result.state);
    }
  }

  navigate(options) {
    this.dispatch(navigate(options));
  }

  pop(options?) {
    this.dispatch(pop(options));
  }
}
