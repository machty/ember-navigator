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

function route(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new RouteDescriptor(name, childrenDesc || []);
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

  recognize(url) : any[] {
    let result = this.recognizer.recognize(url);
    if (result) {
      return result.slice(0);
    } else {
      return [];
    }
  }
}

function createMap(desc: MapChildrenDescriptor) : Map {

  // MVP route-recognizer can work _between_ states...
  // which means it can't work?
  // what if i make it work everywhere, and for each
  // thing that I add, each state will have a path of `/`.
  // Problem: route-recognizer needs to support returning multiple routes.
  // `/foo/bar/baz` will get added twice.
  // maybe the intermediate `{ path: '/', handler: SPECIAL_STATE_SYMBOL }`
  // gets used twice, and when we recognize, we do the comparison.


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
  assert.expect(2);

  let map = createMap([
    route('foo', [
      route('foochild')
    ]),
    route('bar'),
  ]);

  let result;
  result = map.recognize('foo/foochild');
  assert.deepEqual(result.map(({ handler }) => handler), [ 'foo', 'foochild' ]);
  result = map.recognize('bar');
  assert.deepEqual(result.map(({ handler }) => handler), [ 'bar' ]);
});