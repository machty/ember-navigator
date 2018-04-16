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

  constructor(listener: NavStackListener) {
    this.listener = listener;
    this.frames = [];
    this.push('some frame desc');
  }

  push(...args) {
    let frames = this.frames.slice();
    frames.push(this.makeFrame());
    this.frames = frames;
    this.listener.onNewFrames(this.frames);
  }

  pop() {
    let frames = this.frames.slice();
    frames.pop();
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