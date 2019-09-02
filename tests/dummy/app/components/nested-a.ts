import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/nested-a';
import { PublicRoute } from 'ember-navigator/-private/public-route';

export default class NestedA extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    header = {
      title: "Nested Route"
    }
  }
}
