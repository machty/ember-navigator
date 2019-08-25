import Ember from 'ember';
import { computed } from '@ember/object';

import { mount } from 'ember-constraint-router';
import { stackRouter, route } from 'ember-constraint-router/map';

export default Ember.Controller.extend({
  mountedRouter: computed(function() {
    return mount([
      stackRouter('root', [
        route('frame-root'),
        route('frame-tweet'),
      ]),
    ]);
  }),

  navigate(options) {
    let normalizedOptions = Object.assign({}, options);
    if (options.key === "GENERATE_UUID") {
      normalizedOptions.key = `uuid-${Math.floor(Math.random() * 10000000)}`;
    }
    this.mountedRouter.navigate(options);
  },

  links: [
    {
      routeName: "frame-root",
      variations: [
        {},
        { key: "a" },
        { key: "b" },
        { key: "c" },
      ]
    },
    {
      routeName: "frame-tweet",
      variations: [
        { params: { tweet_id: "123" } },
        { params: { tweet_id: "456" } },
        { params: { tweet_id: "999" } },
        { params: { tweet_id: "123" }, key: "123" },
        { params: { tweet_id: "456" }, key: "456" },
        { params: { tweet_id: "999" }, key: "999" },
        { params: { tweet_id: "123" }, key: "GENERATE_UUID" },
        { params: { tweet_id: "456" }, key: "GENERATE_UUID" },
        { params: { tweet_id: "999" }, key: "GENERATE_UUID" },
      ]
    },
  ]
});
