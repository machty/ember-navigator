import { set } from "@ember/object";
import { RouterReducer, RouterState, RouteState, RouteableState } from "./routeable";
import { RouterActions, NavigateParams, PopParams } from "./actions/types";
import { navigate, pop } from "./actions/actions";
import { RenderedRouteStateSet, RenderedRouteState } from "./rendered-state";
// import { recomputeStateSet } from "./rendered-state";