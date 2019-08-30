import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-tweet';
import { PublicRoute } from 'ember-constraint-router/-private/public-route';

export default class FrameTweet extends Component {
  layout = layout;

  static Route = class extends PublicRoute {
    get header() {
      return {
        title: `Tweet omg2`
      }
    }
  }
}
