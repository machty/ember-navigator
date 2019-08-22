import Ember from 'ember';
import Component from '@ember/component';
import { assert } from '@ember/debug';
import { get } from '@ember/object';
import { on } from '@ember/object/evented';
import { DataScope } from 'ember-constraint-router/-private/data-engine/data-scope';

export interface ConstraintRouterService {
  routeWillLoad;
}

export function initialize() {
  Component.reopen({
    _registerOnFrame: on('init', function(this: any) {
      if (this._navStackFrame) {
        this._navStackFrame.registerFrameComponent(this, true);
      }
    }),

    _unregisterOnFrame: on('willDestroyElement', function(this: any) {
      if (this._navStackFrame) {
        this._navStackFrame.registerFrameComponent(this, false);
      }
    }),
  });
}

export function scopedService(customKey) {
  return Ember.computed(function(this: any, computedPropertyKey) {
    let key = customKey || computedPropertyKey;
    let dataScope = get(this, `_scope.scope.dataScope`) as DataScope;
    return dataScope.serviceFor(key);
  });
}