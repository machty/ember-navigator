import Ember from 'ember';

export default Ember.Service.extend({
  model: null,

  routeValidation: Ember.computed('model.state', function() {
    let rideState = this.get('model.state');

    return {
      notRiding: !rideState,
      riding: rideState === 'RIDING',
      complete: rideState === 'COMPLETE',
    };
  }),

  rideJson: Ember.computed('model', function() {
    return JSON.stringify(this.get('model'), null, 2);
  }),

  simulateNotRiding() {
    this.set('model', null);
  },

  simulateRiding() {
    this.set('model', {
      state: 'RIDING'
    });
  },

  simulateRideComplete() {
    this.set('model', {
      state: 'COMPLETE'
    });
  }
});