import Route from '@ember/routing/route';

export class Frame {
  constructor(public route: Route, public componentName: String) {
  }
}
