import { LoadState, Freshness } from './load-state';
import { sendEvent } from '@ember/object/events';
import { guidFor } from '../utils';
import { DataNodeResolver } from 'ember-constraint-router/-private/data-engine/data-node-resolver';
import { addListener } from '@ember/object/events';
import RSVP from 'rsvp';
import { assert } from '@ember/debug';

const EMPTY_ARRAY = [];

export type DataNodeListener = (dataNode: DataNode, dataName: string, value: any) => any;

class Value {
  value: any;
  valueSequence: number;

  constructor(public dataName: string) {
    this.valueSequence = 0;
  }

  listen(context: any, method: DataNodeListener) {
    // @ts-ignore: Improperly typed addListener
    addListener(this, 'newValue', context, method);
    if (this.hasProducedValue()) {
      let args = this._listenerArgs();
      method.apply(context, args);
    }
  }

  update(value) {
    this.valueSequence++;
    this.value = value;
    sendEvent(this, 'newValue', this._listenerArgs());
  }

  _listenerArgs() {
    return [this, this.dataName, this.value];
  }

  hasProducedValue() {
    return this.valueSequence > 0;
  }
}

export class DataNode {
  instance: any;
  loadState: LoadState;
  freshness: Freshness;
  values: { [k: string]: Value };
  valueSequence: number;
  loadSequence: number;
  stalenessSequence: number;
  dependencies: string[];
  ownerRefCount: number;
  dependencyCache: any;

  constructor(public name: string, public key: string, public provides: string[]) {
    this.ownerRefCount = 0;
    this.values = {};
    provides.forEach(p => {
      this.values[p] = new Value(p);
    });
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

    let value = this.values[dataName];
    if (value) {
      value.update(object);
    } else {
      console.error(`pushValue but no value for ${dataName}`);
    }
  }

  addDependency(name: string) {
    this.dependencies.push(name);
  }

  startLoading(loadSequence: number) {
    this.provides.forEach(p => {
      this.load(p, loadSequence);
    });
  }

  load(dataName: string, loadSequence: number) {
    // override me
  }

  getProviders() : string[] {
    return EMPTY_ARRAY;
  }

  stashDependencyData(dataName: string, value: any) {
    // console.log(`${this.name} got data from ${sourceDataNode.name}`);
    this.stalenessSequence++;
    this.dependencyCache[dataName] = value;
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

    this.provides.forEach(p => {
      this.values[p].listen(context, method);
    });
  }

  log(message) {
    console.log(`DataNode ${this.name} (${guidFor(this)}): ${message}`);
  }
}

export class RouteDataNode extends DataNode {
  route: any;
  wat: boolean;

  constructor(name: string, key: string, public dataNodeResolver: DataNodeResolver, public params: any) {
    super(name, key, dataNodeResolver.provides); 
    this.wat = false;

  }

  load(dataName: string, loadSequence: number) {
    // if (dataName === 'root') {
    //   debugger;
    // }
    if (!this.route) {
      this.route = this.dataNodeResolver.instantiate({});
    }

    if (this.wat) {
      return;
    }
    this.wat = true;


    if (typeof this.route.load !== 'function') {
      // TODO: assert? default to model()?
      this.pushValue(dataName, { empty: 'lol' });
      return;
    }

    let loadPojo = this.route.load(this.params);
    this.provides.forEach(p => {
      assert(`expected the object returned from ${this.name}'s load() method to provide a key for provided value ${p}`, p in loadPojo);
      RSVP.resolve(loadPojo[p]).then(v => {
        // debugger;
        this.pushValue(p, v);
      });
    });
  }
}

export class StateDataNode extends DataNode {
  service: any;

  constructor(name: string, key: string, public dataNodeResolver: DataNodeResolver) {
    super(name, key, dataNodeResolver.provides); 
  }

  load(dataName: string, loadSequence: number) {
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

  load(dataName: string, loadSequence: number) {
    this.loadState = LoadState.Loading;
    this.pushValue(dataName, this.value);
  }
}