import Ember from 'ember';

let RouteRecognizer;
RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];

interface MapChild {
  name: string;
  childrenDesc : MapChildrenDescriptor;
  makeSegment: () => HandlerInfo;
}

class RouteDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment() {
    return { path: this.name, handler: this.name };
  }
}

const STATE_DESCRIPTOR = "STATE_DESCRIPTOR";
const WHEN_DESCRIPTOR = "WHEN_DESCRIPTOR";

class StateDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment() {
    return { path: '/', handler: STATE_DESCRIPTOR };
  }
}

class WhenDescriptor implements MapChild {
  name: string;
  childrenDesc: MapChildrenDescriptor;

  constructor(name, childrenDesc) {
    this.name = name;
    this.childrenDesc = childrenDesc;
  }

  makeSegment() {
    return { path: '/', handler: WHEN_DESCRIPTOR };
  }
}

export function route(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new RouteDescriptor(name, childrenDesc || []);
}

export function state(name: string, childrenDesc?: MapChildrenDescriptor) : MapChild {
  return new StateDescriptor(name, childrenDesc || []);
}

export function when(conditionObj: any, childrenDesc: MapChildrenDescriptor) : MapChild {
  return new WhenDescriptor(name, childrenDesc);
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
      this._addRecursive([...parentSegments, child.makeSegment()], child.childrenDesc)
    });

    return true;
  }

  recognize(url) : HandlerInfo[] {
    let result = this.recognizer.recognize(url) as HandlerInfo[];
    if (result) {
      let routeHandlers: any[] = [];

      result.slice(0).forEach(h => {
        if (h.handler !== STATE_DESCRIPTOR && 
            h.handler !== WHEN_DESCRIPTOR) {
          routeHandlers.push(h);
        }
      });

      return routeHandlers;
    } else {
      return [];
    }
  }
}

export function createMap(desc: MapChildrenDescriptor) : Map {
  let map = new Map();
  map.add(desc);
  return map;
}