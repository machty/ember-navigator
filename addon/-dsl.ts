import RouteRecognizer from 'ember-constraint-router/-route-recognizer';

interface MapChild {
  name: string;
  childrenDesc : MapChildrenFn;
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

interface RouteDescriptorOptions {
  path?: string;
  key?: string;
}

class RouteDescriptor implements MapChild {
  name: string;
  options: RouteDescriptorOptions;
  childrenDesc: MapChildrenFn;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    let path = this.options.path || this.name;
    return { path, handler: { key, name: this.name } };
  }
}

interface StateDescriptorOptions {
  key?: string;
}

class StateDescriptor implements MapChild {
  name: string;
  options: StateDescriptorOptions;
  childrenDesc: MapChildrenFn;

  constructor(name, options, childrenDesc) {
    this.name = name;
    this.options = options;
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

class WhenDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenFn;

  constructor(childrenDesc) {
    this.name = 'when';
    this.childrenDesc = childrenDesc;
  }

  makeSegment(key) : RecognizerSegment {
    return { path: '/', handler: { key, name: this.name } };
  }
}

const nullChildrenFn = () => [];

type RouteDescriptorArgs = RouteDescriptorOptions | MapChildrenFn;
export function route(name: string, options: RouteDescriptorArgs = {}, childrenFn?: MapChildrenFn) : MapChild {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new RouteDescriptor(name, options, childrenFn);
}

type StateDescriptorArgs = StateDescriptorOptions | MapChildrenFn;
export function state(name: string, options: StateDescriptorArgs = {}, childrenFn?: MapChildrenFn) : MapChild {
  if (arguments.length === 2 && typeof options === 'function') {
    childrenFn = options;
    options = {}
  }

  return new StateDescriptor(name, options, childrenFn);
}

export function when(conditionObj: any, childrenDesc: MapChildrenFn) : MapChild {
  return new WhenDescriptor(childrenDesc);
}

interface HandlerInfo {
  handler: any;
}

type MapChildrenFn = (...any) => MapChild[];

class Map {
  recognizer: any;

  constructor() {
    this.recognizer = new RouteRecognizer();
  }

  add(children: MapChildrenFn) {
    this._addRecursive([], children, '');
  }

  _addRecursive(parentSegments, childrenDesc: MapChildrenFn, parentKey: string) : Boolean {
    let children = childrenDesc ? childrenDesc() : [];

    if (children.length === 0) {
      this.recognizer.add(parentSegments);
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

export function createMap(desc: MapChildrenFn) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}