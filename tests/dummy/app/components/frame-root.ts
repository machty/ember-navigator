import Component from '@ember/component';
import { default as EmberObject } from '@ember/object';

// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-root';

export default class FrameRoot extends Component {
  layout = layout;

  static Route = class {
    static provides() { return ['rootThing']; }

    load() {
      return {
        rootThing: {
          foo: 123
        }
      };
    }
  }
}
