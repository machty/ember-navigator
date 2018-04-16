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

  constructor(listener: NavStackListener) {
    this.listener = listener;
    this.frames = [];
    this._sequence = 0;
    this.stateString = "";
  }

  recognize(url) {
    return {
      handler: url.split('/').pop()
    };
  }

  didUpdateStateString(stateString: string) {
    let json = JSON.parse(stateString);

    let frames = json.map((j) => {
      let param = this.recognize(j.url);
      return {
        componentName: param.handler,
        outletState: {
          scope: {
            myRouter: this.makeRouter(),
          }
        }
      };
    });

    this._updateFrames(frames);
    // this.push('some frame desc');
  }

  push(...args) {
    let frames = this.frames.slice();
    frames.push(this.makeFrame());
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

  transitionTo(...args) {
    this.navStack.push(...args);
  }

  goBack() {
    this.navStack.pop();
  }
}