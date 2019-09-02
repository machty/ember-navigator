import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/enter-email';
import { PublicRoute } from 'ember-navigator/-private/public-route';

export default class EnterEmail extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    header = {
      title: "Terms of Service"
    }
  }
}
