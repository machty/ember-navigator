import Route from '@ember/routing/route';

export default class FrameRoot extends Route.extend({
  load() {
    return {
      rootThing: {
        foo: 123
      }
    };
  }
}) {
  static provides() { return ['rootThing']; }
}
