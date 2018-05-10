
import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { Promise } from 'rsvp';
import { scopedService } from 'ember-constraint-router';

export default class extends Route {
  static provides() { return ['signInThing']; }

  load({ user_id }) {
    return {
      signInThing: { foo: 123 }
    };
  }
}
