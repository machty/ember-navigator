import { Routeable } from '../routeable';
import { Action } from '../action';
import { generateKey } from '../key-generator';

export type StackOptions = {
  componentName?: string;
}

export class StackRouter implements Routeable {
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

  getStateForAction(action: Action, state: any) {
    return {
      // how does this get used
      key: 'StackRouterRoot',
      isTransitioning: false,
      index: 0,
      routes: [
        {
          params: action.params,
          // ...childState,
          key: action.key || generateKey(),
          routeName: action.routeName,
        },
      ],
    };
  }
}
