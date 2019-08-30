import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/nested-a';
import { PublicRoute } from 'ember-constraint-router/-private/public-route';

export default class NestedA extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    header = {
      title: "Nested Route"
    }
  }
}
