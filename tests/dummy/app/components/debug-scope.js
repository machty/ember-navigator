import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),
  auth: scopedService(),

  actions: {
    goBack() {
      this.get('myRouter').goBack();
    },

    push(url) {
      this.get('myRouter').transitionTo(url);
    },
  }
});