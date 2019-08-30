import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/enter-email';
import { PublicRoute } from 'ember-constraint-router/-private/public-route';

export default class EnterEmail extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    header = {
      title: "Terms of Service"
    }
  }
}
