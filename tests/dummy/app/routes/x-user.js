import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { Promise } from 'rsvp';
import { scopedService } from 'ember-constraint-router';

export default class extends Route.extend({
  signInThing: scopedService(),
}) {
  static provides() { return ['user', 'fun']; }

  load({ user_id }) {
    let signInThing = this.signInThing;
    let user = { id: user_id, name: 'alex' };
    return new Promise(r => {
      setTimeout(() => {
        r({
          user,
          fun: Math.floor(300 * Math.random()),
        })
      }, 800);
    });
  }
}
