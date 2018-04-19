import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { not } from '@ember/object/computed';

export default Route.extend({
  name: computed(function() {
    return `ride-${guidFor(this)}`;
  }),

  currentRide: null,
  notRiding: not('currentRide'),
});