import { test, module } from 'ember-qunit';
import { route, switchRouter, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import MountedRouter from 'ember-constraint-router/-private/mounted-router';
import { Resolver } from 'ember-constraint-router/-private/routeable';
import { PublicRoute } from 'ember-constraint-router/-private/public-route';

function buildTestResolver() {
  let events: any[] = [];
  let delegateId = 0;

  class Route extends PublicRoute {
    id: number = delegateId++;

    update(state: any) {
      events.push({ id: this.id, type: "update", key: state.key});
    }

    unmount() {
      events.push({ id: this.id, type: "unmount"});
    }

    mount() {
      events.push({ id: this.id, type: "mount"});
    }

    focus() {
    }

    blur() {
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

module('Unit - MountedRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("basic shallow switch router state", function (assert) {
    let router = switchRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);
    mountedRouter.navigate({ routeName: 'bar' })
    mountedRouter.navigate({ routeName: 'bar' })
    mountedRouter.navigate({ routeName: 'foo' })
    mountedRouter.navigate({ routeName: 'foo' })
    assert.deepEqual(events, [
      {
        "id": 1,
        "key": "foo",
        "type": "update"
      },
      {
        "id": 2,
        "key": "bar",
        "type": "update"
      },
      {
        "id": 1,
        "type": "unmount"
      },
      {
        "id": 3,
        "key": "foo",
        "type": "update"
      },
      {
        "id": 2,
        "type": "unmount"
      }
    ]);
  });
})
