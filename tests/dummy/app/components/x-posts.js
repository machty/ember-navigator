import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),
  xUser: scopedService('x-user'),

  header: {
    leftButton: 'wat'
  },
});