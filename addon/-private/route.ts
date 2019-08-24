import { Routeable } from './routeable';

export type RouteOptions = {
  componentName?: string;
}

export class Route implements Routeable {
  name: string;
  children: Routeable[];
  options: RouteOptions;

  constructor(name: string, options: RouteOptions) {
    this.name = name;
    this.children = [];
    this.options = options;
  }
}
