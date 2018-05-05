import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { Promise } from 'rsvp';

export default class extends Route {
  static provides() { return ['user', 'thing']; }

  user({ user_id }) {
    let user = { id: user_id, name: 'alex' };
    return new Promise(r => {
      setTimeout(() => {
        r(user);
      }, 800);
    });
  }

  thing() {
    return { foo: 12345 };
  }
}