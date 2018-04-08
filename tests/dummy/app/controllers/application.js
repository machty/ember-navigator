import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Controller.extend({
  currentRide: service(),

  actions: {
    simulateNotRiding() {
      this.get('currentRide').simulateNotRiding();
    },

    simulateRiding() {
      this.get('currentRide').simulateRiding();
    },

    simulateRideComplete() {
      this.get('currentRide').simulateRideComplete();
    }
  }
});