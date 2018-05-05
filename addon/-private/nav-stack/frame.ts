import { DataNode, DataNodeObserver } from 'ember-constraint-router/-private/data-engine/data-node';
import { DataNodeResolver } from 'ember-constraint-router/-private/data-engine/data-node-resolver';
import { DataScope } from '../data-engine/data-scope';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { guidFor } from '../utils';

export class Frame {
  componentName: string;
  outletState: any;
  value: any;
  dataNode: DataNode;
  component: any;

  constructor(public url: string, public dataScope: DataScope, public id: number) {
    this.value = {
      componentName: this.componentName,
      outletState: {
        scope: this
      }
    };

    this.dataNode = new DataNodeObserver('_frameRoot', `_frameRoot-${this.id}`);
    this.dataNode.listen(this, this.handleNewData);
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

  registerFrameComponent(component) {
    frameConnections.push([this, component]);
    run.scheduleOnce('afterRender', null, connectComponentsToFrames);
  }
}

let frameConnections: [Frame, any][] = [];

function connectComponentsToFrames() {
  frameConnections.forEach(([frame, frameComponent]) => {
    console.log(`registering component frame id ${frame.id} fc=${guidFor(frameComponent)}`);
    set(frame, 'component', frameComponent);
  });
  frameConnections = [];
}