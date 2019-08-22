import Ember from 'ember';
import { DataNodeResolver } from '../data-engine/data-node-resolver';
import { DataScope } from '../data-engine/data-scope';
import { RouteDataNode, StateDataNode, SimpleDataNode } from '../data-engine/data-node';
import { Frame } from './frame';
import { Map, MapScope } from '../../-dsl';
import { assert } from '@ember/debug';
import { set } from '@ember/object';

export interface NavParams {
  scope: MapScope;
  params: any;
  key: string;
}

export class NavStack {
  frames: Frame[];
  stateString: string;
  recognizer: any;
  frameSequence: number;
  dataNodeResolverCache: { [k: string]: DataNodeResolver };

  constructor(public map: Map, public owner) {
    const RouteRecognizer = (Ember as any).__loader.require('route-recognizer')['default']
    this.recognizer = new RouteRecognizer();

    map.root.childScopes.forEach(r => {
      debugger;
    })

    this.frames = [];
    this.frameSequence = 0;
    this.stateString = "";
    this.dataNodeResolverCache = {};
  }

  recognize(url) : NavParams[] {
    let results = this.recognizer.recognize(url);
    debugger;
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
    json.forEach((j, index) => {
      let lastFrame = frames[frames.length - 1];
      let lastScope = lastFrame && lastFrame.dataScope;
      frames.push(this.frameFromUrl(j.url, lastScope, index));
    });

    this._updateFrames(frames);
  }

  resolverFor(type: string, dasherizedName: string) : DataNodeResolver {
    let fullName = `${type}:${dasherizedName}`;
    if (fullName in this.dataNodeResolverCache) {
      return this.dataNodeResolverCache[fullName];
    }

    let dataNodeResolver = new DataNodeResolver(this.owner, type, dasherizedName);
    this.dataNodeResolverCache[fullName] = dataNodeResolver;
    return dataNodeResolver;
  }

  frameFromUrl(url, baseScope: DataScope, index: number) : Frame {
    let dataScope = new DataScope(baseScope);
    let navParamsArray = this.recognize(url);
    let componentName = navParamsArray[navParamsArray.length-1].scope.name;
    let frame = new Frame(url, dataScope, componentName, this.frameSequence++);

    navParamsArray.forEach(navParams => {
      let dasherizedName = navParams.scope.name;

      let dataNodeResolver = this.resolverFor('route', dasherizedName);

      let dataNode = dataScope.lookup(dasherizedName, navParams.key) ||
        new RouteDataNode(navParams.scope.name, navParams.key, dataNodeResolver, dataScope, navParams.params);

      dataScope.register(dasherizedName, dataNode);

      dataNode.provides.forEach(p => {
        frame.dataNode.addDependency(p)
      });
    });

    let dataNode = new SimpleDataNode('myRouter', `my-router-${frame.id}`, this.makeRouter(url, index));
    dataScope.register(dataNode.name, dataNode);
    dataScope.start();
    return frame;
  }

  navigate() {
    // TODO
  }

  push(url) {
    let frames = this.frames.slice();

    let lastFrame = frames[frames.length - 1];
    let lastScope = lastFrame && lastFrame.dataScope;

    frames.push(this.frameFromUrl(url, lastScope, frames.length));
    this._updateFrames(frames);
  }

  pop() {
    let frames = this.frames.slice();
    frames.pop();
    this._updateFrames(frames);
  }

  _updateFrames(frames) {
    set(this, 'frames', frames);
  }

  makeRouter(url: string, index: number) {
    return new MicroRouter(this, url, index);
  }
}

export class MicroRouter {
  constructor(public navStack: NavStack, public url: string, public index: number) { }

  transitionTo(o, ...args) {
    this.navStack.push(o);
  }

  goBack() {
    this.navStack.pop();
  }
}