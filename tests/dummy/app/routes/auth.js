import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { not, or } from '@ember/object/computed';

export default Route.extend({
  name: computed(function() {
    return `auth-${guidFor(this)}`;
  }),

  // currently if it's falsy it's bad.

  currentUser: null,
  userAbsent: not('currentUser'),

  init(...args) {
    this._super(...args);
    Ember.run.later(() => {
      this.set('currentUser', {})
    }, 2000);
  }
});