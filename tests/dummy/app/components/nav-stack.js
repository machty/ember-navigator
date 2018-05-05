import Ember from 'ember';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack';
import { computed } from '@ember/object';

export default Ember.Component.extend({
  frames: null,
  navStack: null,
  classNames: ['nav-stack'],

  visibleFrames: computed('frames', 'isDebugMode', function() {
    let frames = this.frames;
    let lastFrame = frames[frames.length - 1];
    return [lastFrame];
  }),

  currentFrame: computed('frames.length', function() {
    return this.frames[this.frames.length - 1];
  }),
});