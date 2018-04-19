import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';

export default Route.extend({
  name: computed(function() {
    return `user-absent-${guidFor(this)}`;
  }),
});