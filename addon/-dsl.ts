import RouteRecognizer from 'ember-constraint-router/-route-recognizer';

interface MapChild {
  name: string;
  childrenDesc : MapChildrenDescriptor;
  makeSegment: (key: string) => HandlerInfo;
}

interface RecognizerHandler {
  key: string;
  name: string;
}

interface RecognizerSegment {
  handler: RecognizerHandler;
  path: string;
}

class RouteDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: this.name, handler: { key, name: this.name } };
  }
}

class StateDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

class WhenDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(childrenDesc) {
    this.name = 'when';
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

export function route(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new RouteDescriptor(name, childrenDesc || []);
}

export function state(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new StateDescriptor(name, childrenDesc || []);
}

export function when(conditionObj: any, childrenDesc: MapChildrenDescriptor) : MapChild {
  return new WhenDescriptor(childrenDesc);
}

interface HandlerInfo {
  handler: any;
}

type MapChildren = MapChild[];
type MapChildrenFn = (...any) => MapChildren;
type MapChildrenDescriptor = MapChildren | MapChildrenFn;

class Map {
  recognizer: any;

  constructor() {
    this.recognizer = new RouteRecognizer();
  }

  add(children: MapChildrenDescriptor) {
    this._addRecursive([], children, '');
  }

  _addRecursive(parentSegments, childrenDesc: MapChildrenDescriptor, parentKey: string) : Boolean {
    let children = (typeof childrenDesc === 'function') ? childrenDesc() : childrenDesc;

    if (children.length === 0) {
      this.recognizer.add(parentSegments, {as: 'wat'});
      return false;
    }

    let segments = [...parentSegments, {}];
    children.forEach((child, index) => {
      let key = `${parentKey}.${index}`;
      this._addRecursive([...parentSegments, child.makeSegment(key)], child.childrenDesc, key);
    });

    return true;
  }

  recognizeAll(url) : HandlerInfo[][] {
    return this.recognizer.recognizeAll(url).map(r => {
      let result = r as HandlerInfo[];

      let routeHandlers: any[] = [];

      result.slice(0).forEach(h => {
        routeHandlers.push(h);
      });

      return routeHandlers;
    });
  }

  recognize(url) : HandlerInfo[] {
    return this.recognizeAll(url)[0];
  }
}

export function createMap(desc: MapChildrenDescriptor) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}