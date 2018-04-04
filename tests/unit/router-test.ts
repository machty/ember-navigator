import { test, module } from 'ember-qunit';
import { StateTree, Node } from 'ember-constraint-router/-vtree';
import Ember from 'ember';

let RouteRecognizer;
RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];

interface MapChild {
  name: string;
  childrenDesc : MapChildrenDescriptor;
  makeSegment: () => any;
}

class RouteDescriptor implements MapChild {
  name: string;
  childrenDesc : MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment() {
    return { path: this.name, handler: this.name };
  }
}

const STATE_DESCRIPTOR = "STATE_DESCRIPTOR";

class StateDescriptor implements MapChild {
  name: string;
  childrenDesc : MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment() {
    return { path: '/', handler: STATE_DESCRIPTOR };
  }
}

function route(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new RouteDescriptor(name, childrenDesc || []);
}

function state(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new StateDescriptor(name, childrenDesc || []);
}

interface HandlerInfo {
  handler: any;
}

type MapChildren = MapChild[];
type MapChildrenFn = () => MapChildren;
type MapChildrenDescriptor = MapChildren | MapChildrenFn;

class Map {
  recognizer: any;

  constructor() {
    this.recognizer = new RouteRecognizer();
  }

  add(children: MapChildrenDescriptor) {
    this._addRecursive([], children);
  }

  _addRecursive(parentSegments, childrenDesc: MapChildrenDescriptor) : Boolean {
    let children = (typeof childrenDesc === 'function') ? childrenDesc() : childrenDesc;

    if (children.length === 0) {
      debugger;
      this.recognizer.add(parentSegments, {as: 'wat'});
      return false;
    }

    let segments = [...parentSegments, {}];
    children.forEach(child => {
      let name = child.name;
      this._addRecursive([...parentSegments, child.makeSegment()], child.childrenDesc)
    });

    return true;
  }

  recognize(url) : HandlerInfo[] {
    let result = this.recognizer.recognize(url) as HandlerInfo[];
    if (result) {
      let routeHandlers: any[] = [];

      result.slice(0).forEach(h => {
        if (h.handler !== STATE_DESCRIPTOR) {
          routeHandlers.push(h);
        }
      });

      return routeHandlers;
    } else {
      return [];
    }
  }
}

function createMap(desc: MapChildrenDescriptor) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}

module('Unit - Router test', {
  beforeEach: function () {
  },
  afterEach: function () {
  },
});

test('router map', function (assert) {
  assert.expect(3);

  let map = createMap([
    route('foo', [
      route('foochild'),
      state('admin', [
        route('posts')
      ]),
    ]),
    route('bar'),
  ]);

  let result;
  result = map.recognize('foo/foochild');
  assert.deepEqual(result.map(({ handler }) => handler), ['foo', 'foochild']);
  result = map.recognize('bar');
  assert.deepEqual(result.map(({ handler }) => handler), ['bar']);
  result = map.recognize('foo/posts');
  assert.deepEqual(result.map(({ handler }) => handler), ['foo', 'posts']);
});