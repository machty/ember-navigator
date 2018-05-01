import Ember from 'ember';
import { NavStack, MicroRouter } from 'ember-constraint-router/-nav-stack';
import { computed } from '@ember/object';

export default Ember.Component.extend({
  _stateString: '_unset_',
  stateString: '',
  frames: null,
  navStack: null,
  isDebugMode: false,

  visibleFrames: computed('frames', 'isDebugMode', function() {
    let frames = this.frames;
    if (this.isDebugMode) {
      return frames;
    } else {
      let lastFrame = frames[frames.length - 1];
      return [lastFrame];
    }
  }),

  currentFrame: computed('frames.length', function() {
    return this.frames[this.frames.length - 1];
  }),

  init(...args) {
    this._super(...args);

    let owner = Ember.getOwner(this);
    let map = owner.factoryFor('constraint-router:main').class;

    this.navStack = new NavStack(map, owner, {
      onNewFrames: (frames) => {
        this.set('frames', frames);

        // TODO: split URL from other forms of serialization that may be used.
        this._stateString = JSON.stringify(frames.map(f => ({ url: f.url })));
        this.set('stateString', this._stateString);
      }
    });

    this.didUpdateStateString();
  },

  didUpdateStateString: Ember.observer('stateString', function() {
    let stateString = this.get('stateString') || 
      JSON.stringify([ { url: 'demo/sign-in' } ]);
      // JSON.stringify([ { url: 'demo/users/amatchneer/x-posts' } ]);
      // JSON.stringify([ { url: 'demo/sign-in' } ]);

    if (stateString !== this._stateString) {
      this._stateString = stateString;
      this.navStack.didUpdateStateString(stateString);
    }
  }),
});