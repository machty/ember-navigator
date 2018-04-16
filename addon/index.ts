import Ember from 'ember';

export interface ConstraintRouterService {
  routeWillLoad;
}

declare module '@ember/service' {
  interface Registry {
    ["-constraint-router"]: ConstraintRouterService;
  }
}

export function initialize() {
  Ember.Router.reopen({
    _constraintRouter: Ember.inject.service('-constraint-router'),

    _scheduleLoadingEvent(transition, route) {
      this._super(transition, route);
      let constraintRouter = this.get('_constraintRouter');
      constraintRouter.routeWillLoad(route, transition);
    },
  });

  Ember.Component.reopen({
    _registerOnConstraintRouter: Ember.on('init', function() {
      if (!this._scope) {
        return;
      }
      // debugger;

      // this._scope.registerFrameComponent();

      // todo: register `this` on frame?
    }),
  });
}

export function scopedService() {
  return Ember.computed(function(key) {
    let service = Ember.get(this, `_scope.${key}`)
    Ember.assert(`scoped service ${key} does not appear to be available on this scope`, service);
    return service;
  });
}