import Ember from 'ember';
import { alias } from '@ember/object/computed';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),
  frameComponent: alias('frame.component'),

  actions: {
    leftButton() {
      this.get('myRouter').goBack();
    }
  }
});