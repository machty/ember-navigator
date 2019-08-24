import Ember from 'ember';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

import { stackNavigator, route } from 'ember-constraint-router/map';
import { Router } from 'ember-constraint-router/-private/router';

let routerMap = stackNavigator('root', [
  route('frame-root'),
  route('frame-tweet'),
]);

export default Ember.Controller.extend({
  frames: readOnly('navStack.frames'),
  navStack: readOnly(`navStacks.lastObject`),

  customRouter: computed(function() {
    return new Router(routerMap);
  }),

  navigate(options) {
    let normalizedOptions = Object.assign({}, options);
    if (options.key === "GENERATE_UUID") {
      normalizedOptions.key = `uuid-${Math.floor(Math.random() * 10000000)}`;
    }
    this.customRouter.navigate(options);
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
