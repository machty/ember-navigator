import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Controller.extend({
  currentRide: service(),
  currentUser: service(),

  actions: {
    simulateLogin() {
      this.get('currentUser').simulateLogin();
    },

    simulateLogout() {
      this.get('currentUser').simulateLogout();
    },

    simulateNotRiding() {
      this.get('currentRide').simulateNotRiding();
    },

    simulateRiding() {
      this.get('currentRide').simulateRiding();
    },

    simulateRideComplete() {
      this.get('currentRide').simulateRideComplete();
    },
  }
});