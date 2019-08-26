import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-stack';
import { computed } from '@ember/object';
import { RouterState } from 'ember-constraint-router/-private/routeable';
import { recomputeStateSet } from 'ember-constraint-router/-private/rendered-state';
import { getOwner } from '@ember/application';
// import { toLeft, toRight } from 'ember-animated/transitions/move-over';
import move from 'ember-animated/motions/move';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';
import fade from 'ember-animated/transitions/fade';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';


export default class EcrStack extends Component.extend({
  currentStates: computed('currentState', function() {
    let state = this.state as RouterState;
    return state.routes.map(r => this.activeRouteStates[r.key]);
  }),

  currentState: computed('state', function() {
    let state = this.state as RouterState;
    let currentRouteState = state.routes[state.index];
    return this.activeRouteStates[currentRouteState.key];
  }),

  _previousRouteStates: null,
  activeRouteStates: computed('state', function() {
    return this._previousRouteStates = recomputeStateSet(
      this.state as RouterState,
      getOwner(this),
      this._previousRouteStates || {});
  }),

  * transition({ insertedSprites, keptSprites, removedSprites }) {
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: 300 });
      sprite.applyStyles({ 'z-index': 1 });
      move(sprite, { easing: easeOut });
    });

    removedSprites.forEach(sprite => {
      sprite.startAtPixel({ x: 0 });
      sprite.endAtPixel({ x: 300 });
      sprite.applyStyles({ 'z-index': 1 });
      move(sprite, { easing: easeOut });
    });
  },
}) {
  layout = layout;
  state: RouterState;
};
