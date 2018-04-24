import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { Promise } from 'rsvp';

export default Route.extend({
  model({ user_id }) {
    let value = { id: user_id, name: 'alex' };
    // return value;
    return new Promise(r => {
      setTimeout(() => {
        r(value);
      }, 600);
    });
  }
});