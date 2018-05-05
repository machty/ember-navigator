import Ember from 'ember';
import { alias } from '@ember/object/computed';
import { scopedService } from 'ember-constraint-router';
import { computed } from '@ember/object';

export default Ember.Component.extend({
  // this scoped service seems messed up
  // probably something to do with either scopedService CP not having
  // depkey on the _scope provided to Component, or that _scope is
  // never updated thereafter since it's not a reference?
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