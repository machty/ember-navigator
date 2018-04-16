import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),

  init() {
    this._super();
    console.log("LIFECYCLE init");
  },

  willDestroy() {
    console.log("LIFECYCLE willDestroy");
  },

  currentRide: Ember.inject.service(),
});