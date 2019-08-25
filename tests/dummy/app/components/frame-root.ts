import Component from '@ember/component';

// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-root';

export default class FrameRoot extends Component {
  layout = layout;

  static Config = {
    header: {
      title: "Root Header Title"
    }
  }
}
