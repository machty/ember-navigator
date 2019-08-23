import Route from '@ember/routing/route';

export default class FrameTweet extends Route {
  load(params) {
    let { tweet_id } = params;
    return {
      tweet: {
        id: tweet_id,
        text: `I am tweet with id=${tweet_id}. Here is my text content`,
      }
    };
  }

  static provides = ['tweet'];
}
