import { default as EmberObject } from '@ember/object';
import { setOwner } from '@ember/application';

const DEFAULT_FACTORY = {
  class: EmberObject
};

export class DataNodeResolver {
  factory: any;
  provides: string[];
  constructor(public owner: any, public type: string, public dasherizedName: string) {
    let fullName = `${type}:${dasherizedName}`;

    let factory = owner.factoryFor(fullName);
    if (!factory) {
      // Couldn't find route:name-of-frame, see if it's a static class on the component
      let componentFactory = owner.factoryFor(`component:${dasherizedName}`);
      if (componentFactory && componentFactory.class.Route) {
        factory = { class: componentFactory.class.Route };
      }
    }

    if (!factory) {
      factory = DEFAULT_FACTORY;
    }

    this.factory = factory;

    let provides = this.factory.class.provides;
    if (typeof provides === 'function') {
      this.provides = provides();
    } else {
      this.provides = provides || [];
    }
  }
  instantiate(attrs?: any) {
    let instance;
    let klass = this.factory.class;
    if (typeof klass.create === 'function') {
      instance = klass.create(attrs);
    } else {
      instance = new klass(attrs);
    }
    setOwner(instance, this.owner);
    return instance;
  }
}