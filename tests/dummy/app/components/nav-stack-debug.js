import Ember from 'ember';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack';
import { computed } from '@ember/object';

export default Ember.Component.extend({
  frames: null,
  navStack: null,

  currentFrame: computed('frames.length', function() {
    return this.frames[this.frames.length - 1];
  }),
});