import Ember from 'ember';
import map from '../constraint-router';

export default Ember.Component.extend({
  map2: map,
  stateString: "",

  showStack: false,

  header: {
    title: "Sign In"
  },

  actions: {
    enableStack() {
      this.set('showStack', true);
      //alert('enable')
    }
  }
});