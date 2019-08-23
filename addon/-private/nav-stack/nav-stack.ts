import Ember from 'ember';
import { Frame } from './frame';
import { Map } from '../../-dsl';
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import { DataNodeResolver } from '../data-node-resolver';

type NavigateOptions = {
  routeName: string;
  params?: object;
  key?: string;
}

export class NavStack {
  frames: Frame[];
  recognizer: any;
  frameSequence: number;
  dataNodeResolverCache: { [k: string]: DataNodeResolver };

  constructor(public map: Map, public owner) {
    const RouteRecognizer = (Ember as any).__loader.require('route-recognizer')['default']
    this.recognizer = new RouteRecognizer();

    map.forEach(r => {
      let path = r.options.path || r.name;
      this.recognizer.add([{ path, handler: r.name }], { as: r.name });
    });

    this.frames = [];
    this.frameSequence = 0;
    this.dataNodeResolverCache = {};
  }

  didUpdateStateString(stateString: string) {
    // This is a poorly named method that's used for initializing
    // the nav stack to a particular URL
    this.buildInitialStack(stateString);
  }

  buildInitialStack(stateString: string) {
    let json = JSON.parse(stateString);

    let frames: any[] = [];
    json.forEach((j, index) => {
      frames.push(this.frameFromUrl(j.url, frames[frames.length - 1], index));
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

  // TODO: get rid of index?
  frameFromUrl(url: String, lastFrame: Frame, index: number) : Frame {
    let results = this.recognizer.recognize(url);
    assert(`failed to parse/recognize url ${url}`, results);
    let result = results[0];
    let dasherizedName = result.handler;
    let routeResolver = this.resolverFor('route', dasherizedName);
    let inheritedProvides = lastFrame ? lastFrame.providedValues : {};
    let frame = new Frame(result, routeResolver, dasherizedName, inheritedProvides, null);
    return frame;
  }

  // https://reactnavigation.org/docs/en/navigation-prop.html#navigate-link-to-other-screens
  navigate(maybeRouteName, params?: any) {
    if (arguments.length == 1 && typeof maybeRouteName === 'object') {
      return this._navigate(maybeRouteName);
    } else {
      return this._navigate({ routeName: maybeRouteName, params: params });
    }
  }

  _navigate(options : NavigateOptions) {
    let routeName = options.routeName;
    let params = options.params || {};
    let key = options.key || null;

    let foundFrame, foundIndex;
    for(foundIndex = 0; foundIndex < this.frames.length; ++foundIndex) {
      let frame = this.frames[foundIndex];
      if (frame.componentName === routeName) {
        if (!key || key === frame.key) {
          foundFrame = frame;
          break;
        }
      }
    }

    if (foundFrame) {
      for (let i = this.frames.length - 1; i > foundIndex; --i) {
        let frame = this.frames[i];

        // TODO: other teardown
        frame.route.destroy();
      }
      this._updateFrames(this.frames.slice(0, foundIndex + 1));
      return;
    }

    let info = this.recognizer.handlersFor(routeName)[0]
    let routeResolver = this.resolverFor('route', routeName);
    let lastFrame = this.frames[this.frames.length - 1];
    let inheritedProvides = lastFrame ? lastFrame.providedValues : {};
    let frame = new Frame({ handler: info.handler, params }, routeResolver, routeName, inheritedProvides, key);
    this._pushFrame(frame);
  }

  push(url) {
    let newFrame = this.frameFromUrl(url, this.frames[this.frames.length - 1], this.frames.length);
    this._pushFrame(newFrame);
  }

  _pushFrame(frame) {
    let frames = [...this.frames, frame]
    this._updateFrames(frames);
  }

  pop() {
    if (this.frames.length <= 1) {
      return;
    }
    let frames = this.frames.slice();
    frames.pop();
    this._updateFrames(frames);
  }

  _updateFrames(frames) {
    set(this, 'frames', frames);
  }

  goBack() {
    this.pop();
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