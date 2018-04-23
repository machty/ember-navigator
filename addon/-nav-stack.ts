import { Map } from './-dsl';
import Ember from 'ember';
import { assert } from '@ember/debug';

const RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];
const RouterJs = Ember.__loader.require("router")['default'];
const EmberRouterDSL = Ember.__loader.require("ember-routing/system/dsl")['default'];

const EMPTY_ARRAY = [];

class DataPool {
  nodes: AsyncDataNode[];
  mark: number;

  constructor() {
    this.nodes = [];
    this.mark = 0;
  }

  register(node: AsyncDataNode) {
    this.nodes.push(node);
  }

  sweep() {
    let remainingNodes = [];
    // this.nodes.filter(n => n.mark === this.mark);
  }
}

class AsyncDataNode {
  state: 'as';
  value: any;
  mark: number;

  constructor(public key: string, public deps: string[] = EMPTY_ARRAY) {
    this.mark = 0;
  }

  // freshness: 'fresh' | 'loading' | 'depsLoading'

  // how does this know that the upstream is stale?

  // user -> wat -> comments
  // if each line takes 2 seconds to resolve, and user invalidates and
  // starts loading again, how do wat/comments realize this?




  // User
  // deps: []
  // keyid: 'user-123'
  //
  // Wat
  // deps: {
  //   'user-123': { latest: null}
  // }
  //
  // Comments
  // deps: {
  //   'user-123': {}
  // }


}







interface FrameState {
  componentName: string;
  outletState: any;
}

interface NavStackListener {
  onNewFrames: (frames: FrameState[]) => void;
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
  frames: FrameState[];
  _sequence: number;
  stateString: string;
  recognizer: null;
  dataPool: DataPool;

  constructor(public map: Map, public owner, public listener: NavStackListener) {
    // Hackishly delegate to ember router dsl / router.js to generate
    // the same kind of Route Recognizer that would be generated internally.
    let edsl = new EmberRouterDSL(null, {});
    this.map.mount(edsl);
    let routerjs = new RouterJs();
    routerjs.map(edsl.generate());
    let recognizer = routerjs.recognizer;
    this.recognizer = recognizer;
    this.dataPool = new DataPool();

    this.frames = [];
    this._sequence = 0;
    this.stateString = "";
  }

  recognize(url) {
    let results = this.recognizer.recognize(url);
    assert(`failed to parse/recognize url ${url}`, results);

    let name = results[results.length - 1].handler;
    let mapScopes = this.map.getScopePath(name);

    assert(`unexpected empty map scopes for url ${url}`, mapScopes.length > 0);

    let r = 0;
    return mapScopes.map(ms => {
      let params;
      if (ms.type === 'route' && ms.name !== 'root') {
        let recog = results[r++];
        assert(`ran out of recognizer results`, recog.handler === ms.name);
        params = recog.params;
      } else {
        params = {};
      }

      return {
        scope: ms,
        params,
      };
    });
  }

  didUpdateStateString(stateString: string) {
    this.stateString = stateString;
    this.buildInitialStack();
  }

  buildInitialStack() {
    let json = JSON.parse(this.stateString);

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
    let recogResults = this.recognize(url);
    // debugger;

    let matchKeys: string[] = [];

    for (let m = 0; m < recogResults.length; m++) {
      let recog = recogResults[m];
      let ms = recog.scope;

      if (ms.type === 'route') {
        let dasherized = ms.desc.name;
        let camelized = Ember.String.camelize(dasherized);

        let keyParts = ms.desc.params.map(k => `${k}=${recog.params[k]}`);
        let key = `${camelized}_${keyParts.join('&')}`;

        let dataNode = new AsyncDataNode(key, matchKeys.slice());
        this.dataPool.register(dataNode);

        let instance = frameScope.registry[camelized];
        if (instance && instance.scopeData.key !== key) {
          instance = null;
        }

        if (instance) {
          // TODO: update existing references on the downstream instance???
        } else {
          let factory = this.owner.factoryFor(`route:${dasherized}`)
          let scopeData = { params: recog.params, key };
          instance = factory.class.create({ scopeData });
          frameScope.register(camelized, instance);
        }
      }

      if (ms.type === 'when') {
        let sourceName: string = Ember.String.camelize(ms.desc.source.desc.name);
        let sourceInstance = frameScope.registry[sourceName];
        assert(`couldn't find source factory for ${sourceName}`, sourceInstance);
        let dasherized = ms.desc.condition;
        let camelized = Ember.String.camelize(dasherized);

        let key = `${sourceName}_${camelized}`;
        matchKeys.push(key);
        let dataNode = new AsyncDataNode(key);
        this.dataPool.register(dataNode);

        let matchData = sourceInstance.get(camelized);
        if (!matchData) {
          // so this is resolving the data now.
          // but i don't think this should be a .get()
          // this should be an observable?
          // other routes / models are observables sending
          // values downward too? Or maybe they're just
          // updating the value in space? Both should work.

          // we need to avoid a situation though where the match
          // emits another data and then that is received downstream.
          // there needs to be a gate at the match.

          // take current user.
          // current user subscribes to auth.
          // auth nulls out the current user.
          // match(current-user)

          // auth
          // match(auth, 'current-user')
          //   route('i-use-current-user')

          // currentUser subscribes to auth-user.
          // it emits values from auth user right until the moment
          // that it's invalid, then it emits invalid.
          // route 'i-use-current-user' subscribes to 'current-user'.
          // it'll only get new users, never. 

          // ember observable state:
          // - no value yet
          // - value present
          // - value present but stale


          // auth is its own thing. There's no reference.
          // match will produce a reference and hook into the
          // auth service.

          // MVP:
          // have it return a reference.











          console.log(`${sourceName} ${dasherized} is invalid`)

          // todo need to get rid of this for now....

        //   return {
        //     componentName: 'invalid-scope',
        //     url, // needed for serializing into url
        //     outletState: { scope: frameScope }
        //   };
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
            // debugger;
            instance = factory.class.create({ matchData });
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