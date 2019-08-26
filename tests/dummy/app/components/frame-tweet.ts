import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-tweet';
import { RouteState } from "ember-constraint-router/-private/routeable";
import { Config } from 'ember-constraint-router';

export default class FrameTweet extends Component {
  layout = layout;

  static Config = class extends Config {
    header = {
      title: `Tweet ${this.state.params.tweet_id}`
    }
  }
}
