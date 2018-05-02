import Ember from 'ember';
import map from '../constraint-router';
import { computed } from '@ember/object';
import { NavStack } from 'ember-constraint-router/-nav-stack';

export default Ember.Controller.extend({
  queryParams: ['nav', 'debug'],
  nav: "",
  _navCache: '_unset_',
  debug: false,
  map,
  frames: null,

  navStack: computed(function() {
    let owner = Ember.getOwner(this);

    return new NavStack(map, owner, {
      onNewFrames: (frames) => {
        this.set('frames', frames);
        this._nav = JSON.stringify(frames.map(f => ({ url: f.url })));
        this.set('nav', this._nav);
      }
    });
  }),

  didUpdateStateString: Ember.on('init', Ember.observer('nav', function() {
    let nav = this.get('nav') || 
      JSON.stringify([ { url: 'demo/sign-in' } ]);
      // JSON.stringify([ { url: 'demo/users/amatchneer/x-posts' } ]);
      // JSON.stringify([ { url: 'demo/sign-in' } ]);

    if (nav !== this._nav) {
      this._nav = nav;
      this.get('navStack').didUpdateStateString(nav);
    }
  })),
});
