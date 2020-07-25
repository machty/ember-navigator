import { NavigatorRoute } from 'ember-navigator';

export default class FrameTweetRoute extends NavigatorRoute {
  header = {
    title: "Tweet omg2"
  }
  get tweetId() {
    return this.node.routeableState.params.tweet_id;
  }
}
