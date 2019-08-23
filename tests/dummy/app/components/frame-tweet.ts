import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/frame-tweet';

export default class FrameTweet extends Component {
  layout = layout;
  provided: { tweet: any; }

  get tweet() {
    return this.provided.tweet;
  }
}
