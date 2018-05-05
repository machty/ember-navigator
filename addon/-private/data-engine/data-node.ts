import { LoadState, Freshness } from './load-state';
import { sendEvent } from '@ember/object/events';
import { guidFor } from '../utils';
import { DataNodeResolver } from 'ember-constraint-router/-private/data-engine/data-node-resolver';
import { addListener } from '@ember/object/events';
import RSVP from 'rsvp';

const EMPTY_ARRAY = [];

export type DataNodeListener = (dataNode, string, any) => any;

export class DataNode {
  instance: any;
  loadState: LoadState;
  freshness: Freshness;
  value: any;
  valueSequence: number;
  loadSequence: number;
  stalenessSequence: number;
  dependencies: string[];
  ownerRefCount: number;
  dependencyCache: any;

  constructor(public name: string, public key: string, public provides: string[]) {
    this.ownerRefCount = 0;
    this.value = null;
    this.loadState = LoadState.Init;
    this.freshness = Freshness.Stale;
    this.dependencies = [];
    this.stalenessSequence = 1;
    this.loadSequence = 0;
    this.valueSequence = 0;
    this.dependencyCache = {};
  }

  pushValue(dataName: string, object: any) {
    if (this.ownerRefCount <= 0) {
      console.log(`DataNode ${this.name} ignoring pushValue because ownerRefCount=${this.ownerRefCount}`);
      return;
    }

    this.value = object;
    this.valueSequence++;
    sendEvent(this, 'newValue', [this, dataName, this.value]);
  }

  addDependency(name: string) {
    this.dependencies.push(name);
  }

  startLoading(loadSequence: number) {
    this.provides.forEach(p => {
      this.load(p);
    });
  }

  load(dataName: string) {
    // override me
  }

  hasProducedValue() {
    return this.valueSequence > 0;
  }

  getProviders() : string[] {
    return EMPTY_ARRAY;
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
      return;
    }

    if (this.loadSequence < this.stalenessSequence) {
      this.log(`${this.name} has all dependencies, starting loading`);
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

  listen(context: any, method: DataNodeListener) {
    // @ts-ignore: Improperly typed addListener
    addListener(this, 'newValue', context, method);
  }

  log(message) {
    console.log(`DataNode ${this.name} (${guidFor(this)}): ${message}`);
  }
}

export class RouteDataNode extends DataNode {
  route: any;

  constructor(name: string, key: string, public dataNodeResolver: DataNodeResolver, public params: any) {
    super(name, key, dataNodeResolver.provides); 
  }

  load(dataName: string) {
    if (!this.route) {
      this.route = this.dataNodeResolver.instantiate({});
    }

    let method = this.route[dataName];
    if (typeof method !== 'function') {
      // TODO: assert? default to model()?
      this.pushValue(dataName, { empty: 'lol' });
      return;
    }

    RSVP.resolve().then(() => {
      let stubbedHackyTransition = { resolveIndex: 0 };
      return method.call(this.route, this.params, stubbedHackyTransition);
    }).then((v) => {
      this.pushValue(dataName, v);
    }, (e) => {
      alert(`error not implemented: ${e.message}`)
    });
  }
}

export class StateDataNode extends DataNode {
  service: any;

  constructor(name: string, key: string, public dataNodeResolver: DataNodeResolver) {
    super(name, key, dataNodeResolver.provides); 
  }

  load(dataName: string) {
    if (!this.service) {
      this.service = this.dataNodeResolver.instantiate({});
    }

    this.loadState = LoadState.Loading;
    this.pushValue(dataName, this.service);
  }
}

export class SimpleDataNode extends DataNode {
  constructor(name: string, key: string, public value: any) {
    super(name, key, [name]); 
  }

  load(dataName: string) {
    this.loadState = LoadState.Loading;
    this.pushValue(dataName, this.value);
  }
}

// a DataNodeObserver doesn't logically provide anything...
// it just forwards data? This is only used by the _frameRoot
// to detect when all dependencies are loaded and then broadcast
// a new outletState.
export class DataNodeObserver extends DataNode {
  constructor(name: string, key: string) {
    super(name, key, ['observer']); 
  }

  startLoading(loadSequence: number) {
    // currently this is only used by FrameNode.
    // default behavior is to produce a value???
    this.pushValue(this.name, {});
  }
}