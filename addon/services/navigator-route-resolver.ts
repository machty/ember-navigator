import { getOwner } from '@ember/application';
import Service from '@ember/service';

export default class NavigatorRouteResolver extends Service {
  containerType = 'navigator-route';

  resolve(routeName: string) {
    let owner = getOwner(this);
    let fullNavigatorRouteName = `${this.containerType}:${routeName}`;
    let factory = owner.factoryFor(fullNavigatorRouteName);

    if (factory) {
      return factory;
    }

    return owner.factoryFor(`${this.containerType}:basic`);
  }
}
