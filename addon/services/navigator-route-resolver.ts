import { getOwner } from '@ember/application';
import Service from '@ember/service';

import type NavigatorRoute from 'ember-navigator/-private/navigator-route';
import type { Resolver } from 'ember-navigator/-private/routeable';

// TODO: more official way to type getOwner?
interface Owner {
  factoryFor(routeName: string): typeof NavigatorRoute;
}

export default class NavigatorRouteResolver extends Service implements Resolver {
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
