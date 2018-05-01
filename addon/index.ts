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
    _registerOnFrame: Ember.on('init', function() {
      if (this._navStackFrame) {
        this._navStackFrame.registerFrameComponent(this);
      }
    }),
  });
}

export function scopedService(customKey) {
  return Ember.computed(function(computedPropertyKey) {
    let key = customKey || computedPropertyKey;
    let service = Ember.get(this, `_scope.frameScope.registry.${key}`)
    if (!service) { debugger; }
    Ember.assert(`scoped service ${key} does not appear to be available on this scope`, service);
    return service.value;
  });
}