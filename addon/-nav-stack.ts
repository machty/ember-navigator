import { Map, MapScope } from './-dsl';
import Ember from 'ember';
import { assert } from '@ember/debug';

const RouteRecognizer = Ember.__loader.require('route-recognizer')['default'];
const RouterJs = Ember.__loader.require("router")['default'];
const EmberRouterDSL = Ember.__loader.require("ember-routing/system/dsl")['default'];

const EMPTY_ARRAY = [];

const DEFAULT_FACTORY = {
  class: Ember.Object
};

enum LoadState {
  Init = 'INIT',
  Loading = 'LOADING',
  Loaded = 'LOADED',
};

enum Freshness {
  Stale = 'STALE',
  Fresh = 'FRESH',
};

class DataNode {
  instance: any;
  loadState: LoadState;
  freshness: Freshness;
  value: any;
  valueOptions: any;
  notify: (DataNode, any) => void;

  constructor(public name: string, notify) {
    this.notify = notify;
    this.loadState = LoadState.Init;
    this.freshness = Freshness.Stale;
  }

  pushValue(object: any, options: any) {
    this.value = object;
    this.valueOptions = options;
    this.notify(this, this.value);
  }

  startLoading() {
  }
}

class RouteDataNode extends DataNode {
  constructor(public navParams: NavParams, public owner: any, notify) {
    super(navParams.scope.name, notify);
  }

  startLoading() {
    if (!this.instance) {
      let dasherizedName = this.navParams.scope.name;
      let factory = this.owner.factoryFor(`route:${dasherizedName}`) || DEFAULT_FACTORY;
      let camelized = Ember.String.camelize(dasherizedName);

      // let scopeData = { params: recog.params, key };
      let scopeData = {
        pushValue: (object, options) => {
          this.pushValue(object, options);
        }
      };
      this.instance = factory.class.create({ scopeData });
    }

    this.loadState = LoadState.Loading;

    if (this.instance.model) {
      Ember.RSVP.resolve().then(() => {
        return this.instance.model(this.navParams.params);
      }).then((v) => {
        this.pushValue(v, {});
      }, (e) => {
        alert(`error not implemented: ${e.message}`)
      });
    } else {
      this.pushValue({ empty: 'lol' }, {});
    }
  }

}


interface FrameState {
  componentName: string;
  outletState: any;
}

interface NavStackListener {
  onNewFrames: (frames: FrameState[]) => void;
}

interface NavParams {
  scope: MapScope;
  params: any;
  key: string;
}

class FrameScope {
  registry: { [k: string]: DataNode };
  dataNodes: DataNode[];
  notifyNewData: (DataNode, any) => void;

  newData: [DataNode, any][];

  constructor(base?: FrameScope) {
    this.registry = {};
    this.dataNodes = [];
    if (base) {
      Object.assign(this.registry, base.registry);
    }
    this.newData = [];
    this.notifyNewData = this._notifyNewData.bind(this);
  }

  _notifyNewData(dataNode: DataNode, value: any) {
    this.newData.push([dataNode, value]);
    Ember.run.scheduleOnce('actions', this, this._flushNewData);
  }

  _flushNewData() {
    let newData = this.newData;
    this.newData = [];

    // newData is an array of newly resolved data. For each value we
    // need to loop through the tree and provide other data nodes with
    // their new dependent values.

    newData.forEach(([dataNode, value]) => {
      debugger;
    });

    // what should we do now?
    // we need to actually fulfill the thing with a scoped service.
    // at this point the nodes aren't done.

    // basically the question is whether we can provide a stable Frame to render.
    // will all the services properly have a scoped service.

    // how does a frame know if it's ready to render?
    // it needs to switch between component loading?

    // solution: introduce a data node for the frame?



  }

  register(dataNode: DataNode) {
    this.registry[dataNode.name] = dataNode;
    this.dataNodes.push(dataNode);
  }

  startLoading() {
    this.dataNodes.forEach(dataNode => {
      dataNode.startLoading();
    });
  }
}

class Frame {
  componentName: string;
  url: string;
  outletState: any;
  value: any;

  constructor(public frameScope: FrameScope) {
    let dataNode = new DataNode('_frameRoot', (dataNode: DataNode, value: any)  => {
      debugger;
    });

    this.frameScope.register(dataNode);


    // TODO: register dependencies...

    // frameScope.register(dataNode);
  }
}

export class NavStack {
  frames: FrameState[];
  _sequence: number;
  stateString: string;
  recognizer: any;

  constructor(public map: Map, public owner, public listener: NavStackListener) {
    // Hackishly delegate to ember router dsl / router.js to generate
    // the same kind of Route Recognizer that would be generated internally.
    let edsl = new EmberRouterDSL(null, {});
    this.map.mount(edsl);
    let routerjs = new RouterJs();
    routerjs.map(edsl.generate());
    let recognizer = routerjs.recognizer;
    this.recognizer = recognizer;

    this.frames = [];
    this._sequence = 0;
    this.stateString = "";
  }

  recognize(url) : NavParams[] {
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

      let key = ms.computeKey(params);

      return {
        scope: ms,
        params,
        key,
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

  frameFromUrl(url, baseScope: FrameScope) : Frame {
    let frameScope = new FrameScope(baseScope);
    let frame = new Frame(frameScope);
    frame.url = url;
    frame.componentName = 'invalid-scope'; // fixme
    frame.outletState = { scope: frameScope };
    let navParamsArray = this.recognize(url);

    navParamsArray.forEach(navParams => {
      let dataNode = new RouteDataNode(navParams, this.owner, frameScope.notifyNewData);
      frameScope.register(dataNode);
    });

    // now we have a "tree" of things.
    // go through each one and kick it off?

    frameScope.startLoading();
    debugger;

    return frame;


    // this returns something easily introspectable in the template.
    // componentName, url, outletState

    // can we ask desc for the key?
    // let scopeData = { params: recog.params, key };
    // let instance = factory.class.create({ scopeData });


    /*


    let matchKeys: string[] = [];

    for (let m = 0; m < recogResults.length; m++) {
      let recog = recogResults[m];
      let ms = recog.scope;

      if (ms.type === 'route') {
        let dasherized = ms.desc.name;
        let camelized = Ember.String.camelize(dasherized);

        let keyParts = ms.desc.params.map(k => `${k}=${recog.params[k]}`);
        let key = `${camelized}_${keyParts.join('&')}`;


        let instance = frameScope.registry[camelized];
        if (instance && instance.scopeData.key !== key) {
          instance = null;
        }

        if (instance) {
          // TODO: update existing references on the downstream instance???
        } else {
          let factory = this.owner.factoryFor(`route:${dasherized}`)
          let scopeData = { params: recog.params, key };

          let instance = factory.class.create({ scopeData });
          let dataNode = new AsyncDataNode(key, instance, [...matchKeys]);
          frameScope.register(camelized, dataNode);
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

        let matchData = sourceInstance.get(camelized);
        if (!matchData) {
          console.log(`${sourceName} ${dasherized} is invalid`)
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

          let dataNode = new AsyncDataNode(key, instance, []);
          frameScope.register(camelized, dataNode);
        }
      }

      ms.childScopes.forEach((cs) => {
        if (cs.type !== 'state') { return; }

        return this.makeStateNode(cs);

        // only state scopes should be "entered" on children.
        // matches should only be entered when entered.
        // TODO: should it be possible for states to return validation errors?
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

    */
  }

  makeStateNode(stateScope: MapScope) : DataNode {




    let dasherized = stateScope.name;
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