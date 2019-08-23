import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { guidFor } from '../utils';

export class Frame {
  outletState: any;
  value: any;
  component: any;

  constructor(public componentName: string, public id: number) {
  }
}
