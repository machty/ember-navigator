import { Map } from './-dsl';
import Ember from 'ember';
import { assert } from '@ember/debug';

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

class FactoryNode {
  key: string;
  object?: any;

  constructor(key: string) {
  }
}

class FrameScope {
  registry: any;

  constructor(base?: FrameScope) {
    this.registry = {};
    if (base) {
      Object.assign(this.registry, base.registry);
    }
  }

  register(name: string, object: any) {
    this.registry[name] = object;
  }
}

export class NavStack {
  listener: NavStackListener;
  frames: FrameState[];
  _sequence: number;
  stateString: string;
  map: Map;
  recognizer: null;
  owner: any;

  constructor(map: Map, owner, listener: NavStackListener) {
    this.map = map;
    this.owner = owner;

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
    this.stateString = stateString;
    this.buildInitialStack();
  }

  buildInitialStack() {
    let json;
    if (this.stateString) {
      json = JSON.parse(this.stateString);
    } else {
      json = [
        { url: 'demo/sign-in' }
      ];
    }

    // we need a key serialized into the URL in order to prevent recursion.
    console.log(`old frames length: ${this.frames.length}`);

    let frames: any[] = [];
    json.forEach((j) => {
      let lastFrame = frames[frames.length - 1];
      let lastScope = lastFrame ? lastFrame.outletState.scope : {};
      frames.push(this.frameFromUrl(j.url, lastScope));
    });

    this._updateFrames(frames);
  }

  _revalidate() {
    let frames = this.frames;
    for (let f = 0; f < frames.length; f++) {
      let frame = frames[f];
      let scope = frame.outletState.scope;
      debugger;
    }
  }

  _revalidateFrame() {
    // console.log("REVALIDATING");
  }

  frameFromUrl(url, baseScope: FrameScope) {
    let frameScope = new FrameScope(baseScope);
    let recogResult = this.recognize(url);
    let name = recogResult.handler;
    let mapScopes = this.map.getScopePath(name);

    // when do we rebuild from URL?
    // 1. page reload
    // 2. back/forward button pressed? lets not plan on this.
    //    in future maybe there's way to get history stack to behind like our nav stack.

    // debugger;

    for (let m = 0; m < mapScopes.length; m++) {
      let ms = mapScopes[m];
      if (ms.type === 'when') {
        let sourceName: string = Ember.String.camelize(ms.desc.source.desc.name);
        let sourceInstance = frameScope.registry[sourceName];
        assert(`couldn't find source factory for ${sourceName}`, sourceInstance);
        let dasherized = ms.desc.condition;
        let camelized = Ember.String.camelize(dasherized);

        let matchData = sourceInstance.get(camelized);
        if (!matchData) {
          console.log(`${sourceName} ${dasherized} is invalid`)
          return {
            componentName: 'invalid-scope',
            url, // needed for serializing into url
            outletState: { scope: frameScope }
          };
        }

        // TODO: do we also want to do this before returning?
        // Can invalidate routes become valid? or are we expected to blah blah blah?
        sourceInstance.addObserver(camelized, null, () => {
          // the problem is this is going to refresh state... it's going to
          // recreate everything from scratch from an empty scope.
          // but we need to reuse the current frames and reconcile...
          Ember.run.once(this, this._revalidate);
        });

        // TODO: look at matchData, check for validation errors.
        // if there's a validation error, go no further.

        let instance = frameScope.registry[camelized];
        if (instance) {
          // TODO: update existing references on the downstream instance???
        } else {
          let factory = this.owner.factoryFor(`route:${dasherized}`)
          if (factory) {
            // perhaps this is how we can pass down
            // the latest reference to the current user?
            instance = factory.create({ matchData });
          } else {
            instance = { baz: 1000 };
          }
          frameScope.register(camelized, instance);
        }
      }

      ms.childScopes.forEach((cs) => {
        // only state scopes should be "entered" on children.
        // matches should only be entered when entered.
        // TODO: should it be possible for states to return validation errors?
        if (cs.type === 'state') {
          let dasherized = cs.name;
          let camelized = Ember.String.camelize(dasherized);
          let instance = frameScope.registry[camelized];
          if (!instance) {
            let factory = this.owner.factoryFor(`route:${dasherized}`)
            if (factory) {
              instance = new factory.class();
            } else {
              instance = { baz: 999 };
            }
            frameScope.register(camelized, instance);
          }
        } 
      });
    }

    // IDEA: we maintain a separate registry of living objects so
    // that we can clean them up when they disappear :) :) :)

    // where does the invalidation come from?
    // match('current-user') will decide it's no longer valid.
    // 
    // there needs to be something like route-validations that no
    // longer returns a thing?
    // So it's like we'll run a fn on the concrete 'current-user'
    // for building the requested child scope.
    //
    // 1. instead of the pojo with the randomizd name, we'll actually
    //    create the object 'current-user'. Maybe it'll be a route?
    //   


    frameScope.register('myRouter', this.makeRouter(url));

    return {
      componentName: name,
      url, // needed for serializing into url
      outletState: { scope: frameScope }
    };
  }

  push(url) {
    let frames = this.frames.slice();

    let lastFrame = frames[frames.length - 1];
    let lastScope = lastFrame ? lastFrame.outletState.scope : {};

    frames.push(this.frameFromUrl(url, lastScope));
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

  makeRouter(url) {
    return new MicroRouter(this, url);
  }
}

export class MicroRouter {
  navStack: NavStack;
  url: string;

  constructor(navStack: NavStack, url: string) {
    this.navStack = navStack;
    this.url = url;
  }

  transitionTo(o, ...args) {
    this.navStack.push(o);
  }

  goBack() {
    this.navStack.pop();
  }
}