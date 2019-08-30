import Component from '@ember/component';

// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-root';
import { PublicRoute } from 'ember-constraint-router/-private/public-route';

export default class FrameRoot extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    header = {
      title: "Root Header Title"
    }
  }
}
