import { Map } from './-dsl';
import Ember from 'ember';

const RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];
const RouterJs = Ember.__loader.require("router")['default'];
const EmberRouterDSL = Ember.__loader.require("ember-routing/system/dsl")['default'];

interface FrameState {
  componentName: string;
  outletState: any;
}

interface NavStackListener {
  onNewFrames: (frames: FrameState[]) => void;
}

export class NavStack {
  listener: NavStackListener;
  frames: FrameState[];
  _sequence: number;
  stateString: string;
  map: Map;
  recognizer: null;

  constructor(map: Map, listener: NavStackListener) {
    this.map = map;

    // Hackishly delegate to ember router dsl / router.js to generate
    // the same kind of Route Recognizer that would be generated internally.
    let edsl = new EmberRouterDSL(null, {});
    this.map.mount(edsl);
    let routerjs = new RouterJs();
    routerjs.map(edsl.generate());
    let recognizer = routerjs.recognizer;
    this.recognizer = recognizer;

    this.listener = listener;
    this.frames = [];
    this._sequence = 0;
    this.stateString = "";
  }

  recognize(url) {
    let results = this.recognizer.recognize(url);
    if (!results) {
      throw new Error(`failed to parse/recognize url ${url}`);
    }

    let handler = results[results.length - 1].handler;
    return { handler };
  }

  didUpdateStateString(stateString: string) {
    let json;
    if (stateString) {
      json = JSON.parse(stateString);
    } else {
      json = [
        { url: 'demo/sign-in' }
      ];
    }

    let frames = json.map((j) => this.frameFromUrl(j.url));

    this._updateFrames(frames);
  }

  frameFromUrl(url) {
    let recogResult = this.recognize(url);
    return {
      componentName: recogResult.handler,
      url,
      outletState: {
        scope: {
          myRouter: this.makeRouter(),
        }
      }
    };
  }

  push(url) {
    let frames = this.frames.slice();
    frames.push(this.frameFromUrl(url));
    this._updateFrames(frames);
  }

  pop() {
    let frames = this.frames.slice();
    frames.pop();
    this._updateFrames(frames);
  }

  _updateFrames(frames) {
    this.frames = frames;
    this.listener.onNewFrames(this.frames);
  }

  makeFrame() {
    return {
      componentName: 'sign-in',
      outletState: {
        scope: {
          myRouter: this.makeRouter(),
        }
      }
    };
  }

  makeRouter() {
    return new MicroRouter(this);
  }
}

export class MicroRouter {
  navStack: NavStack;
  constructor(navStack: NavStack) {
    this.navStack = navStack;
  }

  transitionTo(o, ...args) {
    this.navStack.push(o);
  }

  goBack() {
    this.navStack.pop();
  }
}