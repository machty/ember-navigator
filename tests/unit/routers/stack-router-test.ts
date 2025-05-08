import { module, test } from 'qunit';

import { route, stackRouter } from 'ember-navigator';
import { _TESTING_ONLY_normalize_keys } from 'ember-navigator/-private/key-generator';
import { batch, navigate as makeNavigateAction, pop } from 'ember-navigator/actions';

import { handle, navigate } from './helpers';

import type { RouterState } from 'ember-navigator/-private/routeable';

module('Unit - StackRouter test', function (hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test('it provides an overridable componentName', function (assert) {
    let children = [route('foo')];
    let stackRouter1 = stackRouter('root', children);
    let stackRouter2 = stackRouter('root', children, { componentName: 'x-foo' });

    assert.strictEqual(stackRouter1.componentName, 'ecr-stack');
    assert.strictEqual(stackRouter2.componentName, 'x-foo');
  });

  const DEFAULT_STATE = {
    componentName: 'ecr-stack',
    key: 'StackRouterRoot',
    params: {},
    routeName: 'root',
    index: 0,
    routes: [
      {
        key: 'foo',
        params: {},
        routeName: 'foo',
        componentName: 'foo',
      },
    ],
  };

  test('it provides a default state', function (assert) {
    let children = [route('foo')];
    let router = stackRouter('root', children);
    let state = router.getInitialState();

    assert.deepEqual(state, DEFAULT_STATE);
  });

  test('it supports navigating to deeply nested inactive routes', function (assert) {
    let router = stackRouter('root', [
      route('a'),
      stackRouter('deeply', [stackRouter('nested', [route('b')])]),
    ]);
    let initialState = router.getInitialState();
    let state = navigate(router, initialState, 'b');

    assert.deepEqual((state.routes[1] as RouterState).routes, [
      {
        componentName: 'ecr-stack',
        index: 0,
        key: 'nested',
        params: {},
        routeName: 'nested',
        routes: [
          {
            componentName: 'b',
            key: 'b',
            params: {},
            routeName: 'b',
          },
        ],
      } as RouterState,
    ]);
  });

  test('it supports deeply nested sibling stack routers', function (assert) {
    let router = stackRouter('root', [
      stackRouter('a', [route('aa')]),
      stackRouter('b', [route('bb')]),
    ]);
    let initialState = router.getInitialState();
    let state = navigate(router, initialState, 'bb');

    assert.strictEqual(state.index, 1);
  });

  test('it supports nesting', function (assert) {
    let router = stackRouter('root', [stackRouter('nested', [route('foo')])]);

    let initialState = router.getInitialState();

    assert.deepEqual(initialState, {
      componentName: 'ecr-stack',
      index: 0,
      key: 'StackRouterRoot',
      params: {},
      routeName: 'root',
      routes: [
        {
          componentName: 'ecr-stack',
          index: 0,
          key: 'nested',
          params: {},
          routeName: 'nested',
          routes: [
            {
              componentName: 'foo',
              key: 'foo',
              params: {},
              routeName: 'foo',
            },
          ],
        } as RouterState,
      ],
    });

    let state2 = navigate(router, initialState, { routeName: 'foo', key: 'other' });

    assert.deepEqual((state2.routes[0] as RouterState).routes, [
      {
        componentName: 'foo',
        key: 'foo',
        params: {},
        routeName: 'foo',
      },
      {
        componentName: 'foo',
        key: 'other',
        params: {},
        routeName: 'foo',
      },
    ]);
  });

  test('it supports navigation', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let initialState = router.getInitialState();
    let state = navigate(router, initialState, { routeName: 'bar' });

    assert.deepEqual(state, {
      componentName: 'ecr-stack',
      index: 1,
      key: 'StackRouterRoot',
      params: {},
      routeName: 'root',
      routes: [
        {
          componentName: 'foo',
          key: 'foo',
          params: {},
          routeName: 'foo',
        },
        {
          key: 'id-1',
          params: {},
          routeName: 'bar',
          componentName: 'bar',
        },
      ],
    });

    // key-less navigation to a route that's already on the stack is a no-op
    let state2 = navigate(router, state, { routeName: 'bar' });

    assert.strictEqual(state, state2);

    // providing a key causes a push
    let state3 = navigate(router, state2, { routeName: 'bar', key: 'lol' });

    assert.strictEqual(state3.index, 2);
    assert.strictEqual(state3.routes[2].key, 'lol');
  });

  test('it supports popping the stack', function (assert) {
    let children = [route('foo'), route('bar')];
    let router = stackRouter('root', children);
    let initialState = router.getInitialState();

    assert.deepEqual(initialState, DEFAULT_STATE);

    let state2 = navigate(router, initialState, { routeName: 'bar' });

    let state3 = handle(router, pop(), state2);

    assert.deepEqual(state3.routes, DEFAULT_STATE.routes);
  });

  test('it supports letting the deepest stack pop the route', function (assert) {
    let router = stackRouter('root', [route('a'), stackRouter('nested', [route('b'), route('c')])]);
    let initialState = router.getInitialState();
    let state2 = navigate(router, initialState, { routeName: 'nested' });
    let state3 = navigate(router, state2, { routeName: 'c' });
    let state4 = handle(router, pop(), state3);

    assert.strictEqual(state4.index, 1);
  });

  test('it supports navigating with params', function (assert) {
    let router = stackRouter('root', [route('foo')]);
    let state = router.getInitialState();
    let state2 = navigate(router, state, { routeName: 'foo', key: '1', params: { id: 4 } });
    let state3 = navigate(router, state2, { routeName: 'foo', key: '2', params: { id: 5 } });
    let state4 = navigate(router, state3, { routeName: 'foo', key: '3', params: { id: 6 } });
    let allParams = state4.routes.map((r) => ({ params: r.params }));

    assert.deepEqual(allParams, [
      { params: {} },
      { params: { id: 4 } },
      { params: { id: 5 } },
      { params: { id: 6 } },
    ]);
  });

  test('it supports sending batch actions to support popTo + 1', function (assert) {
    let router = stackRouter('root', [
      route('home'),
      route('other'),
      route('login-1'),
      route('login-2'),
    ]);

    let pushRoutes = batch({
      actions: [
        makeNavigateAction({ routeName: 'other' }),
        makeNavigateAction({ routeName: 'login-1' }),
        makeNavigateAction({ routeName: 'login-2' }),
      ],
    });

    let popLoginFlow = batch({
      actions: [makeNavigateAction({ routeName: 'login-1' }), pop()],
    });

    let state = router.getInitialState();
    let state2 = handle(router, pushRoutes, state);

    assert.deepEqual(
      state2.routes.map((r) => r.routeName),
      ['home', 'other', 'login-1', 'login-2']
    );

    let state3 = handle(router, popLoginFlow, state2);

    assert.deepEqual(
      state3.routes.map((r) => r.routeName),
      ['home', 'other']
    );
  });
});
