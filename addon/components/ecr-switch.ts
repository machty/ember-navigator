import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/ecr-switch';
import { computed } from '@ember/object';
import { RouterState } from 'ember-constraint-router/-private/routeable';
import { recomputeStateSet, RenderedRouteState } from 'ember-constraint-router/-private/rendered-state';
import { getOwner } from '@ember/application';
import ComputedProperty, { readOnly } from '@ember/object/computed';
import Ember from 'ember';

export default class EcrSwitch extends Component.extend({
  currentStates: computed('currentState', function() {
    return [this.currentState];
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
}) {
  layout = layout;
  state: RouterState;
};

