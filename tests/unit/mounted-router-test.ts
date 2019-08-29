import { test, module } from 'ember-qunit';
import { route, switchRouter, stackRouter } from 'ember-constraint-router';
import { _TESTING_ONLY_normalize_keys } from 'ember-constraint-router/-private/key-generator';
import { } from 'ember-constraint-router/-private/mounted-router';
import { RouterState, RouteableState } from 'ember-constraint-router/-private/routeable';

// a resolver returns all the information required to render a component.
// for ember this means component name. for react this means a Component.
// for glimmer this might also mean an imported Component.
// each framework provides its own resolver.

class Resolver {
  resolve(): NodeDelegate | null {
    return null;
  }
}

type MountedNodeSet = { [key: string]: MountedNode };

interface NodeDelegate {
  update(state: any): void;
  // mount(): void;
  unmount(): void;
}

class MountedNode {
  childNodes: MountedNodeSet;
  delegate: NodeDelegate | null;
  resolver: Resolver;
  routeableState?: any;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.delegate = this.resolver.resolve();
    // if (this.delegate) {
    //   this.delegate.mount();
    // }
    this.childNodes = {};
  }

  update(routeableState: RouteableState) {
    if (this.routeableState === routeableState) { return; }

    if ((routeableState as any).routes) {
      let currentChildNodes = this.childNodes;
      let nextChildNodes: MountedNodeSet = {};
      let routerState: RouterState = routeableState as RouterState;

      routerState.routes.forEach(childRouteState => {
        let childNode = currentChildNodes[childRouteState.key];
        if (!childNode) {
          childNode = new MountedNode(this.resolver);
        }
        childNode.update(childRouteState);
        nextChildNodes[childRouteState.key] = childNode;
      });

      Object.keys(currentChildNodes).forEach(key => {
        if (nextChildNodes[key]) {
          return;
        }
        currentChildNodes[key].unmount();
      });

      this.childNodes = nextChildNodes;
    }

    if (this.delegate) {
      this.delegate.update(routeableState);
    }

    this.routeableState = routeableState;
  }

  unmount() {
    if (this.delegate) {
      this.delegate.unmount();
    }
  }
}

class MountedRouter {
  // routerState?: RouterState;
  resolver: Resolver;
  rootNode: MountedNode;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.rootNode = new MountedNode(resolver);
  }

  update(routerState: RouterState) {
    this.rootNode.update(routerState);
  }
}

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
    let state = router.getInitialState();
    let { resolver, events } = buildTestResolver();
    let mountedRouter = new MountedRouter(resolver);
    assert.deepEqual(events, [])
    mountedRouter.update(state);

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
    mountedRouter.update(state);
    assert.deepEqual(events, expectedState);
  });
})
