import Ember from 'ember';

export default Ember.Service.extend({
  model: null,

  routeValidation: Ember.computed('model', function() {
    let userPresent = !!this.get('model');

    return {
      present: userPresent,
      absent:  !userPresent,
    };
  }),

  userJson: Ember.computed('model', function() {
    return JSON.stringify(this.get('model'), null, 2);
  }),

  simulateLogin() {
    this.set('model', {
      username: 'machty'
    });
  },

  simulateLogout() {
    this.set('model', null);
  },
});