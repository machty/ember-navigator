import Ember from 'ember';
import { NavStack, MicroRouter } from 'ember-constraint-router/-nav-stack';

export default Ember.Component.extend({
  stateString: '',
  frames: null,
  navStack: null,

  init(...args) {
    this._super(...args);

    this.navStack = new NavStack({
      onNewFrames: (frames) => {
        this.set('frames', frames);
      }
    });

    this.didUpdateStateString();
  },

  didUpdateStateString: Ember.observer('stateString', function() {
    let stateString = this.get('stateString');
    console.log(`stateString = ${this.get('stateString')}`);
  }),
});