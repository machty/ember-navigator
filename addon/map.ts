import { Routeable } from './-private/routeable'
import { StackRouter, StackOptions } from './-private/routers/stack-router'
import { Route, RouteOptions } from './-private/route'

export function route(name: string, options: RouteOptions = {}) : Routeable {
  return new Route(name, options);
}

export function stackNavigator(name: string, children: Routeable[], options: StackOptions = {}) : Routeable {
  return new StackRouter(name, children, options);
}
