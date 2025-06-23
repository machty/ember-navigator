import { module, test } from 'qunit';

import { route, stackRouter, switchRouter } from 'ember-navigator';
import { NavigatorRoute } from 'ember-navigator';
import { _TESTING_ONLY_normalize_keys } from 'ember-navigator/-private/key-generator';
import MountedRouter from 'ember-navigator/-private/mounted-router';

import type { NavigatorRouteConstructorParams } from 'ember-navigator';
import type { Resolver } from 'ember-navigator/-private/routeable';

interface TestEvent {
  id?: number;
  type?: string;
  key?: string;
  name?: string;
}

function buildTestResolver() {
  let events: TestEvent[] = [];
  let delegateId = 0;

  class Route extends NavigatorRoute {
    id: number = delegateId++;

    constructor(...params: NavigatorRouteConstructorParams) {
      super(...params);
      events.push({ id: this.id, type: 'constructor', key: this.node.key });
    }

    update() {
      events.push({ id: this.id, type: 'update', key: this.node.key });
    }

    unmount() {
      events.push({ id: this.id, type: 'unmount', key: this.node.key });
    }

    mount() {
      events.push({ id: this.id, type: 'mount', key: this.node.key });
    }

    focus() {
      events.push({ type: 'focus', name: this.name });
    }

    blur() {
      events.push({ type: 'blur', name: this.name });
    }
  }

  class TestResolver implements Resolver {
    id: number;
    constructor() {
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
        type: 'constructor',
      },
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
      {
        name: 'foo',
        type: 'blur',
      },
      {
        name: 'bar',
        type: 'focus',
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
        type: 'constructor',
      },
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'mount',
      },
      {
        id: 1,
        key: 'foo',
        type: 'constructor',
      },
      {
        id: 1,
        key: 'foo',
        type: 'mount',
      },
      {
        name: 'foo',
        type: 'focus',
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
        type: 'constructor',
      },
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
      {
        name: 'foo',
        type: 'blur',
      },
      {
        name: 'bar',
        type: 'focus',
      },
    ]);

    const fooRoute = mountedRouter.rootNode.childNodes['foo'].route;

    assert.strictEqual(fooRoute.key, 'foo');

    const barRoute = mountedRouter.rootNode.childNodes['id-1'].route;

    assert.strictEqual(barRoute.name, 'bar');
    assert.strictEqual(barRoute.key, 'id-1');
    assert.strictEqual(barRoute.parent, fooRoute);
    assert.strictEqual(barRoute.parent?.parent?.name, 'root');

    assert.strictEqual(barRoute.parentNamed('bar')?.name, 'bar');
    assert.strictEqual(barRoute.parentNamed('bar2'), null);

    assert.strictEqual(barRoute.parent?.parentRoute, null);

    assert.strictEqual(barRoute.parentRouter?.name, 'root');
    assert.strictEqual(barRoute.parent?.parentRouter?.name, 'root');
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
        type: 'constructor',
      },
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
      {
        name: 'foo',
        type: 'blur',
      },
      {
        name: 'bar',
        type: 'focus',
      },
    ]);
  });

  test('stack: popping', function (assert) {
    let router = stackRouter('root', [route('foo'), route('bar')]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    assert.deepEqual(events, [
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'constructor',
      },
      {
        id: 0,
        key: 'StackRouterRoot',
        type: 'mount',
      },
      {
        id: 1,
        key: 'foo',
        type: 'constructor',
      },
      {
        id: 1,
        key: 'foo',
        type: 'mount',
      },
      {
        name: 'foo',
        type: 'focus',
      },
    ]);
    events.length = 0;

    mountedRouter.navigate({ routeName: 'bar' });

    assert.deepEqual(events, [
      {
        id: 2,
        key: 'id-1',
        type: 'constructor',
      },
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
      {
        name: 'foo',
        type: 'blur',
      },
      {
        name: 'bar',
        type: 'focus',
      },
    ]);

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
      {
        name: 'bar',
        type: 'blur',
      },
      {
        name: 'foo',
        type: 'focus',
      },
    ]);
  });

  test('nested stacks: focus events when pushing and popping from the same stack', function (assert) {
    let router = stackRouter('root', [stackRouter('nested', [route('a'), route('b'), route('c')])]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    events.length = 0;

    function getFocusAndBlurs() {
      const blursAndFocuses = events.filter((e) => e.type === 'focus' || e.type === 'blur');

      events.length = 0;

      return blursAndFocuses;
    }

    mountedRouter.navigate({ routeName: 'b' });
    assert.deepEqual(getFocusAndBlurs(), [
      {
        name: 'a',
        type: 'blur',
      },
      {
        name: 'b',
        type: 'focus',
      },
    ]);

    mountedRouter.navigate({ routeName: 'a' });

    assert.deepEqual(getFocusAndBlurs(), [
      {
        name: 'b',
        type: 'blur',
      },
      {
        name: 'a',
        type: 'focus',
      },
    ]);
  });
});
