import { Map, MapScope } from './-dsl';
import Ember from 'ember';
import { assert } from '@ember/debug';
import { sendEvent, addListener } from '@ember/object/events';
import { guidFor } from '@ember/object/internals';

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
  valueSequence: number;
  loadSequence: number;
  stalenessSequence: number;
  valueOptions: any;
  dependencies: string[];
  ownerRefCount: number;
  dependencyCache: any;

  constructor(public name: string) {
    this.ownerRefCount = 0;
    this.value = null;
    this.valueOptions = null;
    this.loadState = LoadState.Init;
    this.freshness = Freshness.Stale;
    this.dependencies = [];
    this.stalenessSequence = 1;
    this.loadSequence = 0;
    this.valueSequence = 0;
    this.dependencyCache = {};
  }

  pushValue(object: any, options: any) {
    if (this.ownerRefCount <= 0) {
      console.log(`DataNode ${this.name} ignoring pushValue because ownerRefCount=${this.ownerRefCount}`);
      return;
    }

    this.value = object;
    this.valueOptions = options;
    this.valueSequence++;
    sendEvent(this, 'newValue', [this, this.value]);
  }

  addDependency(name: string) {
    this.dependencies.push(name);
  }

  startLoading(loadSequence: number) {
    // currently this is only used by FrameNode.
    // default behavior is to produce a value???
    this.pushValue({ woot: 123 }, {});
  }

  hasProducedValue() {
    return this.valueSequence > 0;
  }

  ensureInstance(owner) {
    if (this.instance) { return; }

    let dasherizedName = this.name;
    let factory = owner.factoryFor(`route:${dasherizedName}`) || DEFAULT_FACTORY;

    // let scopeData = { params: recog.params, key };
    let scopeData = {
      pushValue: (object, options) => {
        this.pushValue(object, options);
      }
    };
    this.instance = factory.class.create({ scopeData });
  }

  stashDependencyData(sourceDataNode: DataNode, value: any) {
    // console.log(`${this.name} got data from ${sourceDataNode.name}`);
    this.stalenessSequence++;
    this.dependencyCache[sourceDataNode.name] = value;
  }

  allDependenciesPresent() {
    // return this.dependencies.every(d => d in this.dependencyCache);
    return this.dependencies.every(d => {
      let v = d in this.dependencyCache;
      if (v) {
        this.log(`${this.name} has value for ${d}`);
      } else {
        this.log(`${this.name} STILL NO VALUE for ${d}`);
      }
      return v;
    });
  }

  step() {
    if (!this.allDependenciesPresent()) {
      // console.log(`${this.name} doesn't have all dependencies present, skipping...`);
      return;
    }

    if (this.loadSequence < this.stalenessSequence) {
      this.log(`${this.name} loading`);
      this.loadSequence = this.stalenessSequence;
      this.startLoading(this.loadSequence);
    } else {
      // this.log(`${this.name} skipping step because loadSequence == stalenessSequence`);
    }
  }

  own() {
    this.ownerRefCount++;
  }

  disown() {
    this.ownerRefCount--;
    if (this.ownerRefCount === 0) {
      console.log(`${this.name} ownerRefCount === 0`);
    }
  }

  log(message) {
    console.log(`DataNode ${this.name} (${guidFor(this)}): ${message}`);
  }
}

class SimpleDataNode extends DataNode {
  constructor(name: string, public fixedValue: any) {
    super(name);
  }

  startLoading(loadSequence) {
    this.pushValue(this.fixedValue, {});
  }
}

class RouteDataNode extends DataNode {
  constructor(name: string, public params: any, public owner: any) {
    super(name);
  }

  startLoading(loadSequence) {
    // this is going to get called multiple times
    // because user can exist in multiple nodes.
    // somewhere this caching has to happen. it has to ignore.
    // everything should be represented as data.
    // so maybe we have a staleness counter?
    // it gets bumped when dependencies get bumped.
    //

    this.ensureInstance(this.owner);
    this.loadState = LoadState.Loading;

    if (this.instance.model) {
      // debugger;
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
  constructor(name: string, public owner: any) {
    super(name);
  }

  startLoading(loadSequence) {
    this.ensureInstance(this.owner);
    this.loadState = LoadState.Loading;
    this.pushValue(this.instance, {});
  }
}

interface NavStackListener {
  onNewFrames: (frames: Frame[]) => void;
}

interface NavParams {
  scope: MapScope;
  params: any;
  key: string;
}

class FrameScope {
  registry: { [k: string]: DataNode | null };
  dataNodes: DataNode[];
  newData: [DataNode, any][];

  constructor(base?: FrameScope) {
    this.registry = {};
    this.dataNodes = [];
    this.newData = [];
    if (base) {
      Object.keys(base.registry).forEach(k => {
        this.register(base.registry[k]!);
      });
    }
  }

  _notifyNewData(dataNode: DataNode, value: any) {
    this.newData.push([dataNode, value]);
    console.log(`FrameScope ${guidFor(this)} got data from ${dataNode.name}`);
    Ember.run.scheduleOnce('actions', this, this._flushNewData);
  }

  _flushNewData() {
    let newData = this.newData;
    this.newData = [];

    let dependentNodes: { [k: string]: DataNode[] } = {};
    this.dataNodes.forEach(dataNode => {
      dataNode.dependencies.forEach(d => {
        // TODO: reexamine whether we need to prevent double registers.
        // TODO: .own()
        if (!dependentNodes[d]) {
          dependentNodes[d] = [];
        }
        dependentNodes[d].push(dataNode);
      })
    });

    let nodesWithNewDependentData: { [k: string]: DataNode } = {};

    newData.forEach(([dataNode, value]) => {
      let nodes = dependentNodes[dataNode.name];
      if (!nodes) { return; }
      nodes.forEach(dependentNode => {
        nodesWithNewDependentData[dependentNode.name] = dependentNode;
        dependentNode.stashDependencyData(dataNode, value);
      });
    });

    Object.keys(nodesWithNewDependentData).forEach(k => {
      let dataNode = nodesWithNewDependentData[k];
      dataNode.step();
    });
  }

  register(dataNode: DataNode) {
    let preexistingNode = this.registry[dataNode.name];

    // TODO: SUPER DUMB
    if (preexistingNode &&
        preexistingNode.name !== 'myRouter' &&
        preexistingNode.name !== '_frameRoot') {
      // TODO: use keying rather than name to solve dups.
      // also, TODO: this is hacky; it's weird to create an
      // instance of these DataNodes and then discard them.

      addListener(preexistingNode, 'newValue', this, this._notifyNewData);
      preexistingNode.own();
      this.dataNodes.push(preexistingNode);

      if (preexistingNode.hasProducedValue()) {
        console.log(`SHLORPING UP A VALUE FOR ${preexistingNode.name}`);
        this._notifyNewData(preexistingNode, preexistingNode.value);
      }
    } else {
      this.registry[dataNode.name] = dataNode;
      addListener(dataNode, 'newValue', this, this._notifyNewData);
      dataNode.own();
      this.dataNodes.push(dataNode);
    }
  }

  start() {
    this.dataNodes.forEach(dataNode => {
      dataNode.step();
    });
  }
}

class Frame {
  componentName: string;
  outletState: any;
  value: any;
  dataNode: DataNode;

  constructor(public url: string, public frameScope: FrameScope, public id: number) {
    this.value = {
      componentName: 'x-loading',
      outletState: {
        scope: frameScope
      }
    };

    this.dataNode = new DataNode('_frameRoot');
    addListener(this.dataNode, 'newValue', this, this.handleNewData);
    this.frameScope.register(this.dataNode);
  }

  handleNewData(dataNode: DataNode, value: any) {
    console.log(`frame root (${this.id}) got ${dataNode.name}`, value);
    Ember.set(this, 'value', {
      componentName: this.componentName,
      outletState: {
        scope: this.frameScope
      }
    });
  }
}

export class NavStack {
  frames: Frame[];
  stateString: string;
  recognizer: any;
  frameSequence: number;

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
    this.frameSequence = 0;
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

      return { scope: ms, params, key };
    });
  }

  didUpdateStateString(stateString: string) {
    this.stateString = stateString;
    this.buildInitialStack();
  }

  buildInitialStack() {
    let json = JSON.parse(this.stateString);

    // we need a key serialized into the URL in order to prevent recursion.

    let frames: any[] = [];
    json.forEach((j) => {
      let lastFrame = frames[frames.length - 1];
      let lastScope = lastFrame && lastFrame.frameScope;
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

  frameFromUrl(url, baseScope?: FrameScope) : Frame {
    let frameScope = new FrameScope(baseScope);
    let frame = new Frame(url, frameScope, this.frameSequence++);
    let navParamsArray = this.recognize(url);

    // TODO: DUMB AND HACKY
    frame.componentName = navParamsArray[navParamsArray.length-1].scope.name;

    navParamsArray.forEach(navParams => {
      let dataNode = new RouteDataNode(navParams.scope.name, navParams.params, this.owner);
      frameScope.register(dataNode);

      // frame by default depends on every node in this frame's route hierarchy.
      frame.dataNode.addDependency(dataNode.name)

      navParams.scope.childScopes.forEach((cs) => {
        return this.makeStateNode(cs, frame);
      })
    });

    frameScope.register(new SimpleDataNode('myRouter', this.makeRouter(url)));
    frameScope.start();
    return frame;
  }

  makeStateNode(scope: MapScope, frame: Frame) : void {
    if (scope.type !== 'state') { return; }
    let dasherized = scope.name;
    let camelized = Ember.String.camelize(dasherized);
    let dataNode = new StateDataNode(dasherized, this.owner);
    frame.frameScope.register(dataNode);
  }

  push(url) {
    let frames = this.frames.slice();

    let lastFrame = frames[frames.length - 1];
    let lastScope = lastFrame && lastFrame.frameScope;

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