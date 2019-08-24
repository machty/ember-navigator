import { Routeable } from '../routeable';

export type StackOptions = {
  componentName?: string;
}

export class StackRouter {
  name: string;
  children: Routeable[];
  options: StackOptions;
  componentName: string;

  constructor(name: string, children: Routeable[], options: StackOptions) {
    this.name = name;
    this.children = children;
    this.options = options;

    this.componentName = this.options.componentName || "ecr-stack";
  }
}
