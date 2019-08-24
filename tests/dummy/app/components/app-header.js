import Ember from 'ember';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Ember.Component.extend({
  myRouter: alias('frame.dataScope.registry.myRouter.value'),
  frameComponent: alias('frame.component'),
  header: alias('frameComponent.header'),

  leftButton: computed('header.leftButton', function() {
    let leftButton = this.get('header.leftButton');
    if (leftButton === false) { return; }
    return this.get('myRouter.index') > 0;
  }),

  actions: {
    leftButton() {
      this.get('myRouter').goBack();
    }
  }
});