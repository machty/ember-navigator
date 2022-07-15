import { getOwner } from '@ember/application';
import Service from '@ember/service';

import type NavigatorRoute from 'ember-navigator/-private/navigator-route';

// TODO: more official way to type getOwner?
interface Owner {
  factoryFor(routeName: string): NavigatorRoute;
}

export default class NavigatorRouteResolver extends Service {
  containerType = 'navigator-route';

  resolve(routeName: string) {
    let owner = getOwner(this) as Owner;
    let fullNavigatorRouteName = `${this.containerType}:${routeName}`;
    let factory = owner.factoryFor(fullNavigatorRouteName);

    if (factory) {
      return factory;
    }

    return owner.factoryFor(`${this.containerType}:basic`);
  }
}
