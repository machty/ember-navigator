import Ember from 'ember';
import { scopedService } from 'ember-constraint-router';

export default Ember.Component.extend({
  myRouter: scopedService(),
  numChildren: 0,

  children: Ember.computed(function() {
    let c = [];
    for (let i = 0; i < this.numChildren; i++) { c.push({}); }
    return c;
  }),

  routerGuid: Ember.computed(function() {
    return Ember.guidFor(this.get('myRouter'));
  }),
});