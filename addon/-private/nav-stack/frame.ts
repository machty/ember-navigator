import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { guidFor } from '../utils';

export class Frame {
  outletState: any;
  value: any;
  dataNode: DataNode;
  component: any;

  // What is a frame.
  // Is it a route?

  constructor(public url: string, public dataScope: DataScope, public componentName: string, public id: number) {
    this.value = {
      componentName: null, // this.componentName,
      outletState: {
        scope: this
      }
    };

    this.dataScope.register('_frameRoot', this.dataNode);
  }

  handleNewData(dataNode: DataNode, dataName: string, value: any) {
    console.log(`frame root (${this.id}) got ${dataName} from ${dataNode.name}`, value);
    set(this, 'value', {
      componentName: this.componentName,
      outletState: {
        scope: this
      }
    });
  }

  registerFrameComponent(component, doConnect: boolean) {
    frameConnections.push([this, component, doConnect]);
    run.scheduleOnce('afterRender', null, connectComponentsToFrames);
  }
}

let frameConnections: [Frame, any, boolean][] = [];

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