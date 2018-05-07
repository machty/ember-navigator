import Component from '@ember/component';
import { assert } from '@ember/debug';
import { get, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { DataScope } from 'ember-constraint-router/-private/data-engine/data-scope';

export interface ConstraintRouterService {
  routeWillLoad;
}

export function initialize() {
  Component.reopen({
    _registerOnFrame: on('init', function(this: any) {
      if (this._navStackFrame) {
        this._navStackFrame.registerFrameComponent(this);
      }
    }),
  });
}

export function scopedService(customKey) {
  return computed(function(this: any, computedPropertyKey) {
    let key = customKey || computedPropertyKey;
    let dataScope = get(this, `_scope.dataScope`) as DataScope;
    return dataScope.serviceFor(key);
  });
}