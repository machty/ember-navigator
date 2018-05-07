import Route from '@ember/routing/route';
import { guidFor } from '@ember/object/internals';
import { computed } from '@ember/object';
import { Promise } from 'rsvp';

export default class extends Route {
  static provides() { return ['user', 'fun']; }

  load({ user_id }) {
    let user = { id: user_id, name: 'alex' };
    return new Promise(r => {
      setTimeout(() => {
        r({
          user,
          fun: Math.floor(300 * Math.random()),
        })
      }, 800);
      //     r(user);
      // })
    });
    // return {
    //   user: new Promise(r => {
    //     setTimeout(() => {
    //       r(user);
    //     }, 800);
    //   }),
    //   fun: Math.floor(300 * Math.random()),
    // };
  }
}