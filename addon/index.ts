import Ember from 'ember';
import { get } from '@ember/object';

export function scopedService(customKey) {
  return Ember.computed(function(this: any, computedPropertyKey) {
    let key = customKey || computedPropertyKey;
    return get(this, `provided.${key}`);
  });
}
