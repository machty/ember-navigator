import { default as EmberObject, computed } from '@ember/object';
import { setOwner } from '@ember/application';

const DEFAULT_FACTORY = {
  class: EmberObject
};

export class DataNodeResolver {
  factory: any;
  provides: string[];
  constructor(public owner: any, public type: string, public dasherizedName: string) {
    let fullName = `${type}:${dasherizedName}`;
    this.factory = owner.factoryFor(fullName) || DEFAULT_FACTORY;
    let provides = this.factory.class.provides;
    if (typeof provides === 'function') {
      this.provides = provides();
    } else {
      // by default, a DataNode provides an object with the same
      // as the data node.
      this.provides = [dasherizedName];
    }
  }
  instantiate(attrs) {
    let instance = this.factory.class.create(attrs);
    setOwner(instance, this.owner);
    return instance;
  }
}
