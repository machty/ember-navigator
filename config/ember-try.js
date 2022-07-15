/* eslint-env node */
'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-source': '~3.12.0',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-auto-import': '^2.0.0',
            webpack: '^5.0.0',
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            'ember-auto-import': '^2.0.0',
            webpack: '^5.0.0',
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            'ember-auto-import': '^2.0.0',
            webpack: '^5.0.0',
          },
        },
      },
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      {
        name: 'typescript-3.7',
        npm: {
          devDependencies: {
            '@types/node': '~16.11.7', // @types/node 17.x breaks TS 3.7
            typescript: '~3.7.0',
          },
        },
        command: 'tsc',
      },
      {
        name: 'typescript-3.9',
        npm: {
          devDependencies: {
            typescript: '~3.9.0',
          },
        },
        command: 'tsc',
      },
    ],
  };
};
