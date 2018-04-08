import Ember from 'ember';

export function initialize() {
  Ember.Router.reopen({
    _constraintRouter: Ember.inject.service('-constraint-router'),

    _scheduleLoadingEvent(transition, route) {
      this._super(transition, route);
      let constraintRouter = this.get('_constraintRouter');
      constraintRouter.routeWillLoad(route, transition);
    },
  });
}