import { Routeable } from './routeable';
import { Action } from './action';

export type RouteOptions = {
  componentName?: string;
}

export class Route implements Routeable {
  name: string;
  children: Routeable[];
  options: RouteOptions;
  isRouter: boolean;
  componentName: string;

  constructor(name: string, options: RouteOptions) {
    this.isRouter = false;
    this.name = name;
    this.children = [];
    this.options = options;
    this.componentName = options.componentName || name;
  }
}
