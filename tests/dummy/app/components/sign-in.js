import Ember from 'ember';

import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),

  actions: {
    goBack() {
      this.get('myRouter').goBack();
    },

    doStuff() {
      this.get('myRouter').transitionTo('demo/sign-in');
    },
  }
});