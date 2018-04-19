import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  currentUser: scopedService(),
  ride: scopedService(),
});