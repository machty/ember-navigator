import Ember from 'ember';

import map from '../constraint-router';

export default Ember.Controller.extend({
  queryParams: ['nav', 'debug'],
  nav: "",
  debug: false,
  map,
});
