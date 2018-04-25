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
  dependencies: string[];

  constructor(public name: string, notify) {
    this.notify = notify;
    this.loadState = LoadState.Init;
    this.freshness = Freshness.Stale;
    this.dependencies = [];
  }

  pushValue(object: any, options: any) {
    this.value = object;
    this.valueOptions = options;
    this.notify(this, this.value);
  }

  addDependency(name: string) {
    this.dependencies.push(name);
  }

  startLoading() {
  }

  ensureInstance(owner) {
    if (this.instance) { return; }

    let dasherizedName = this.name;
    let factory = owner.factoryFor(`route:${dasherizedName}`) || DEFAULT_FACTORY;
    let camelized = Ember.String.camelize(dasherizedName);

    // let scopeData = { params: recog.params, key };
    let scopeData = {
      pushValue: (object, options) => {
        this.pushValue(object, options);
      }
    };
    this.instance = factory.class.create({ scopeData });
  }
}

class SimpleDataNode extends DataNode {
  constructor(name: string, public fixedValue: any, notify) {
    super(name, notify);
  }

  startLoading() {
    this.pushValue(this.fixedValue, {});
  }
}

class RouteDataNode extends DataNode {
  constructor(name: string, public params: any, public owner: any, notify) {
    super(name, notify);
  }

  startLoading() {
    this.ensureInstance(this.owner);
    this.loadState = LoadState.Loading;

    if (this.instance.model) {
      Ember.RSVP.resolve().then(() => {
        return this.instance.model(this.params);
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

class StateDataNode extends DataNode {
  constructor(name: string, public owner: any, notify) {
    super(name, notify);
  }

  startLoading() {
    this.ensureInstance(this.owner);
    this.loadState = LoadState.Loading;
    this.pushValue(this.instance, {});
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

    let dependentNodes: { [k: string]: DataNode[] } = {};
    this.dataNodes.forEach(dataNode => {
      dataNode.dependencies.forEach(d => {
        if (!dependentNodes[d]) {
          dependentNodes[d] = [];
        }
        dependentNodes[d].push(dataNode);
      })
    });

    newData.forEach(([dataNode, value]) => {
      let nodes = dependentNodes[dataNode.name];
      if (!nodes) { return; }
      nodes.forEach(dependentNode => {
        dependentNode.notify(dataNode, value);
      });
    });
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
  outletState: any;
  value: any;

  constructor(public frameScope: FrameScope) {
    this.value = {
      componentName: 'x-loading',
      outletState: {
        scope: frameScope
      }
    };

    let dataNode = new DataNode('_frameRoot', (dataNode: DataNode, value: any)  => {
      Ember.set(this, 'value', {
        componentName: 'sign-in',
        outletState: {
          scope: frameScope
        }
      });
    });

    // TODO: compute this dynamically!!!!! later!!!!!!
    dataNode.addDependency('user');

    this.frameScope.register(dataNode);
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
    let navParamsArray = this.recognize(url);

    navParamsArray.forEach(navParams => {
      let dataNode = new RouteDataNode(navParams.scope.name, navParams.params, this.owner, frameScope.notifyNewData);
      frameScope.register(dataNode);

      navParams.scope.childScopes.forEach((cs) => {
        return this.makeStateNode(cs, frame);
      });
    });

    frameScope.register(new SimpleDataNode('myRouter', this.makeRouter(url), frameScope.notifyNewData ));
    frameScope.startLoading();
    return frame;
  }

  makeStateNode(stateScope: MapScope, frame: Frame) : DataNode {
    let dasherized = stateScope.name;
    let camelized = Ember.String.camelize(dasherized);
    let dataNode = new StateDataNode(dasherized, this.owner, frame.frameScope.notifyNewData);
    frame.frameScope.register(dataNode);
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