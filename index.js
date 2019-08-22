/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-constraint-router',

  setupPreprocessorRegistry(type, registry) {

    registry.add('htmlbars-ast-plugin', {
      name: 'add-dynamic-scope-attrs',
      plugin: require('./add-dynamic-scope-attrs'),
      baseDir() { return __dirname; },
    });

    // if (type === 'parent') {
    //   this.parentRegistry = registry;
    // }
  }
};
