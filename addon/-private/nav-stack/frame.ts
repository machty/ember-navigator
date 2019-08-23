import { DataNodeResolver } from '../data-node-resolver';

export type RouteRecognizerInfo = {
  handler: string;
  params: object;
}

export class Frame {
  route: any;
  providedValues: object;
  value: object;

  constructor(public info: RouteRecognizerInfo,
              public routeResolver: DataNodeResolver,
              public componentName: String,
              inheritedProvides: object,
              public key: string | null) {
    this.route = routeResolver.instantiate()
    this.providedValues = Object.assign({}, inheritedProvides);
    this.load();
    // this.key = routeR
  }

  load() {
    let value;
    if (this.route.load) {
      value = this.route.load(this.info.params);
    }
    value = value || {};
    let providedValues = {};
    this.routeResolver.provides.forEach(p => {
      let providedValue = value[p];
      if (!providedValue) {
        console.error(`${this.componentName}'s load() missing provided value '${p}'`);
      }
      providedValues[p] = providedValue;
    });

    Object.assign(this.providedValues, providedValues);
    this.value = value;
  }
}
