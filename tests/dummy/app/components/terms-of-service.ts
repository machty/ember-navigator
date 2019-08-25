import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/enter-email';

export default class EnterEmail extends Component {
  layout = layout;

  static Config = {
    header: {
      title: "Terms of Service"
    }
  }
}
