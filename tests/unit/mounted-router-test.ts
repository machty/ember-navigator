import { module, test } from 'qunit';

import { route, stackRouter, switchRouter } from 'ember-navigator';
import { NavigatorRoute } from 'ember-navigator';
import { _TESTING_ONLY_normalize_keys } from 'ember-navigator/-private/key-generator';
import MountedRouter from 'ember-navigator/-private/mounted-router';

import type { Resolver } from 'ember-navigator/-private/routeable';

function buildTestResolver() {
  let events: any[] = [];
  let delegateId = 0;

  class Route extends NavigatorRoute {
    id: number = delegateId++;

    update(_state: any) {
      events.push({ id: this.id, type: 'update', key: this.node.key });
    }

    unmount() {
      events.push({ id: this.id, type: 'unmount', key: this.node.key });
    }

    mount() {
      events.push({ id: this.id, type: 'mount', key: this.node.key });
    }
  }

  class TestResolver implements Resolver {
    delegates: any[];
    id: number;
    constructor() {
      this.delegates = [];
      this.id = 0;
    }

    resolve() {
      return Route;
    }
  }

  let resolver = new TestResolver();

  return { resolver, events };
}

module('Unit - MountedRouter test', function (hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test('switch: navigation enters/updates the new route and unmounts the old one', function (assert) {
    let router = switchRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;
    mountedRouter.navigate({ routeName: 'bar' });
    assert.deepEqual(events, [
      {
        id: 2,
        key: 'bar',
        type: 'mount',
      },
      {
        id: 1,
        key: 'foo',
        type: 'unmount',
      },
      {
        id: 0,
        key: 'SwitchRouterBase',
        type: 'update',
      },
    ]);
  });

  test('no-op navigations result in zero changes/lifecycle events', function (assert) {
    let router = switchRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;
    mountedRouter.navigate({ routeName: 'foo' });
    assert.deepEqual(events, []);
  });

  test('stack: initial state', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();

    new MountedRouter(router, resolver);
    assert.deepEqual(events, [
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'mount',
      },
      {
        id: 1,
        key: 'foo',
        type: 'mount',
      },
    ]);
  });

  test('stack: no-op', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;
    mountedRouter.navigate({ routeName: 'foo' });
    assert.deepEqual(events, []);
  });

  test('stack: basic nav', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;
    mountedRouter.navigate({ routeName: 'bar' });
    assert.deepEqual(events, [
      {
        id: 2,
        key: 'id-1',
        type: 'mount',
      },
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'update',
      },
    ]);

    const fooRoute = mountedRouter.rootNode.childNodes['foo'].route;

    assert.strictEqual(fooRoute.key, 'foo');

    const barRoute = mountedRouter.rootNode.childNodes['id-1'].route;

    assert.strictEqual(barRoute.name, 'bar');
    assert.strictEqual(barRoute.key, 'id-1');
    assert.strictEqual(barRoute.parent, fooRoute);
    assert.strictEqual(barRoute.parent!.parent!.name, 'root');

    assert.strictEqual(barRoute.parentNamed('bar')!.name, 'bar');
    assert.strictEqual(barRoute.parentNamed('bar2'), null);

    assert.strictEqual(barRoute.parent?.parentRoute, null);

    assert.strictEqual(barRoute.parentRouter!.name, 'root');
    assert.strictEqual(barRoute.parent!.parentRouter!.name, 'root');
  });

  test('stack: basic nav with params', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;
    mountedRouter.navigate({ routeName: 'bar', params: { bar_id: 123 } });
    assert.deepEqual(events, [
      {
        id: 2,
        key: 'id-1',
        type: 'mount',
      },
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'update',
      },
    ]);
  });

  test('stack: popping', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    mountedRouter.navigate({ routeName: 'bar' });
    events.length = 0;
    mountedRouter.navigate({ routeName: 'foo' });
    assert.deepEqual(events, [
      {
        id: 2,
        key: 'id-1',
        type: 'unmount',
      },
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'update',
      },
    ]);
  });
});
