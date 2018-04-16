import Ember from 'ember';

export default Ember.Component.extend({
  init(...args) {
    this._super(...args);
    // Ember.setOwner(this, { jesus: 'christ' });
  },
});