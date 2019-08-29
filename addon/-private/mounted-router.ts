import { set } from "@ember/object";
import { RouterReducer, RouterState } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
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
      console.log(result.state);
      // TODO: dispatch events?
      set(this, 'state', result.state);
    } else {
      console.warn(`mounted-router: unhandled action ${action.type}`);
      debugger;
    }
  }

  navigate(options: NavigateParams) {
    this.dispatch(navigate(options));
  }

  pop(options: PopParams) {
    this.dispatch(pop(options));
  }
}
