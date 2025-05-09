import Controller from '@ember/controller';
import { action } from '@ember/object';

import { mount, NavigatorRoute } from 'ember-navigator';
import { route, stackRouter, switchRouter } from 'ember-navigator';

import type { NavigateParams } from 'ember-navigator/-private/actions/types';

export default class extends Controller {
  // eslint-disable-next-line ember/require-computed-property-dependencies
  mountedRouter = mount(
    // BEGIN-SNIPPET router-map
    switchRouter('auth', [
      stackRouter('logged-out', [route('enter-email'), route('terms-of-service')]),
      stackRouter('logged-in', [
        route('frame-root'),
        route('frame-tweet'),
        stackRouter('nested', [route('nested-a')]),
      ]),
      route('no-header'),
    ]),
    // END-SNIPPET
    (routeName, options) => {
      return {
        navigatorRoute: new NavigatorRoute(routeName),
      }
    }
  );

  @action
  navigate(options: NavigateParams) {
    let normalizedOptions = Object.assign({}, options);

    if (options.key === 'GENERATE_UUID') {
      normalizedOptions.key = `uuid-${Math.floor(Math.random() * 10000000)}`;
    }

    this.mountedRouter.navigate(normalizedOptions);
  }

  links = [
    {
      routeName: 'logged-out',
      variations: [{}],
    },
    {
      routeName: 'enter-email',
      variations: [{}],
    },
    {
      routeName: 'terms-of-service',
      variations: [{}],
    },
    {
      routeName: 'logged-in',
      variations: [{}],
    },
    {
      routeName: 'frame-root',
      variations: [{}, { key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'GENERATE_UUID' }],
    },
    {
      routeName: 'frame-tweet',
      variations: [
        { params: { tweet_id: '123' } },
        { params: { tweet_id: '456' } },
        { params: { tweet_id: '999' } },
        { params: { tweet_id: '123' }, key: '123' },
        { params: { tweet_id: '456' }, key: '456' },
        { params: { tweet_id: '999' }, key: '999' },
        { params: { tweet_id: '123' }, key: 'GENERATE_UUID' },
        { params: { tweet_id: '456' }, key: 'GENERATE_UUID' },
        { params: { tweet_id: '999' }, key: 'GENERATE_UUID' },
      ],
    },
    {
      routeName: 'nested-a',
      variations: [{}, { key: 'a' }, { key: 'b' }, { key: 'c' }, { key: 'GENERATE_UUID' }],
    },
    {
      routeName: 'no-header',
      variations: [{}],
    },
  ];
}
