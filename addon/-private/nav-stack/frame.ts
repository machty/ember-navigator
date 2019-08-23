import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { guidFor } from '../utils';

export class Frame {
  outletState: any;
  value: any;
  component: any;

  constructor(public url: string, public componentName: string, public id: number) {
    this.value = {
      componentName: null, // this.componentName,
      outletState: {
        scope: this
      }
    };
  }

  registerFrameComponent(component, doConnect: boolean) {
    // frameConnections.push([this, component, doConnect]);
    // run.scheduleOnce('afterRender', null, connectComponentsToFrames);
  }
}

let frameConnections: [Frame, any, boolean][] = [];

/*
function connectComponentsToFrames() {
  frameConnections.forEach(([frame, frameComponent, doConnect]) => {
    if (doConnect) {
      console.log(`registering component frame id ${frame.id} fc=${guidFor(frameComponent)}`);
      set(frame, 'component', frameComponent);
    } else {
      console.log(`unregistering component frame id ${frame.id} fc=${guidFor(frameComponent)}`);
      if (frame.component === frameComponent) {
        // Don't clobber if another frame has already set.
        set(frame, 'component', null);
      }
    }
  });
  frameConnections = [];
}
*/
