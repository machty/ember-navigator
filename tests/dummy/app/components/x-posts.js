import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),
  user: scopedService(),
  fun: scopedService(),

  header: {
    leftButton: 'wat',
    title: "Posts",
  },
});