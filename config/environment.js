/* eslint-env node */
'use strict';

module.exports = function(environment /* , appConfig */) {
  let ENV = {}
  if (environment === 'production') {
    ENV.rootURL = '/ember-constraint-router';
    ENV.locationType = 'hash';
  }
  return ENV;
};
