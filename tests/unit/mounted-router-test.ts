import { test, module } from 'ember-qunit';
import { route, switchRouter, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import MountedRouter, { Resolver } from 'ember-constraint-router/-private/mounted-router';

// a resolver returns all the information required to render a component.
// for ember this means component name. for react this means a Component.
// for glimmer this might also mean an imported Component.
// each framework provides its own resolver.


function buildTestResolver() {
  let events: any[] = [];
  let delegateId = 0;

  class TestDelegate implements NodeDelegate {
    id: number;

    constructor() {
      this.id = delegateId++;
    }

    update(state: any) {
      events.push({ id: this.id, type: "update", key: state.key});
    }

    unmount() {
      events.push({ id: this.id, type: "unmount"});
    }

    mount() {
      events.push({ id: this.id, type: "mount"});
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
      return new TestDelegate();
    }
  }
  let resolver = new TestResolver();

  return { resolver, events };
}

module('Unit - MountedRouter test', function(hooks) {
  hooks.beforeEach(() => _TESTING_ONLY_normalize_keys());

  test("initial state", function (assert) {
    let router = switchRouter('root', [
      route('foo'),
      route('bar'),
    ]);
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(router, resolver);

    let expectedState = [
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
        "id": 0,
        "key": "SwitchRouterBase",
        "type": "update"
      }
    ]

    assert.deepEqual(events, expectedState);

    mountedRouter.navigate({ routeName: 'bar' })

    // mountedRouter.update(state);
    assert.deepEqual(events, expectedState);
  });
})
