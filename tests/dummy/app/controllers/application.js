import Ember from 'ember';
import { computed } from '@ember/object';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack';
import { readOnly } from '@ember/object/computed';

import { map } from 'ember-constraint-router';

let routerMap = map(function() {
  this.route('root');
  this.route('a');
  this.route('b');
  this.route('c');
});

export default Ember.Controller.extend({
  frames: readOnly('navStack.frames'),
  navStack: readOnly(`navStacks.lastObject`),
  currentFrame: readOnly(`navStack.frames.lastObject`),

  navStacks: computed(function() {
    let owner = Ember.getOwner(this);
    let navStack = new NavStack(routerMap, owner);
    navStack.didUpdateStateString(JSON.stringify([ { url: 'root' } ]))
    return [ navStack ];
  }),
});
