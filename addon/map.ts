import { Routeable } from './-private/routeable'
import { StackRouter, StackOptions } from './-private/routers/stack-router'
import { Route, RouteOptions } from './-private/route'

export function route(name: string, options: RouteOptions = {}) {
  return new Route(name, options);
}

export function stackRouter(name: string, children: Routeable[], options: StackOptions = {}) {
  return new StackRouter(name, children, options);
}
