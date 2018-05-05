import Ember from 'ember';

export interface ConstraintRouterService {
  routeWillLoad;
}

export function initialize() {
  Ember.Component.reopen({
    _registerOnFrame: Ember.on('init', function(this: any) {
      if (this._navStackFrame) {
        this._navStackFrame.registerFrameComponent(this);
      }
    }),
  });
}

export function scopedService(customKey) {
  return Ember.computed(function(computedPropertyKey) {
    let key = customKey || computedPropertyKey;
    let service = Ember.get(this, `_scope.dataScope.registry.${key}`)
    if (!service) { debugger; }
    Ember.assert(`scoped service ${key} does not appear to be available on this scope`, service);
    return service.value;
  });
}