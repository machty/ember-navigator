import Ember from 'ember';
import { computed } from '@ember/object';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack';
import { readOnly } from '@ember/object/computed';

import { map } from 'ember-constraint-router';

let routerMap = map(function() {
  this.route('frame-root');
  this.route('frame-a');
  this.route('frame-b');
  this.route('frame-c');
  this.route('frame-tweet', { path: "tweet/:tweet_id" });
});

export default Ember.Controller.extend({
  frames: readOnly('navStack.frames'),
  navStack: readOnly(`navStacks.lastObject`),

  navStacks: computed(function() {
    let owner = Ember.getOwner(this);
    let navStack = new NavStack(routerMap, owner);
    navStack.didUpdateStateString(JSON.stringify([ { url: 'frame-root' } ]))
    return [ navStack ];
  }),

  navigate(options) {
    let navStacks = this.navStacks;
    let normalizedOptions = Object.assign({}, options);
    if (options.key === "GENERATE_UUID") {
      normalizedOptions.key = `uuid-${Math.floor(Math.random() * 10000000)}`;
    }
    navStacks[navStacks.length - 1].navigate(normalizedOptions);
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
