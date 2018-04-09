import Service from '@ember/service';
import { getOwner } from '@ember/application';

export default Service.extend({
  activeTransition: null,
  lastRouteLoaded: null,
  map: null,

  init(...args) {
    this._super(...args);
    this._routeNameToScope = {};
    this._scopeNameToRoute = {};
    this.router = getOwner(this).lookup('router:main');

    let map = this._lookupFactory('constraint-router:main');

    if (!map) {
      throw new Error('missing app/constraint-router.js map');
    }
    this.map = map;
  },

  _lookupFactory(name) {
    let owner = getOwner(this);
    if (owner.factoryFor) {
      let result = owner.factoryFor(name);
      return result && result.class;
    } else {
      return owner._lookupFactory(name);
    }
  },

  lookupMapScope(route) {
    let routeName = route.routeName;
    if (routeName in this._routeNameToScope) {
      return this._routeNameToScope[routeName];
    }

    // TODO: full support for resetNamespace and long names.
    let shortName = routeName.split('.').pop();
    let scope = this.map.getScope(shortName);
    this._routeNameToScope[routeName] = scope;
    return scope;
  },

  routeWillLoad(route, transition) {
    let startScope = this.lookupMapScope(route);

    if (!startScope) {
      return;
    }

    let currentScope = startScope.parent;
    let handlerIndex = transition.resolveIndex;

    while (currentScope) {
      if (currentScope.name === 'root') {
        break;
      }

      switch(currentScope.type) {
        case 'route':
          // no need to revalidate more then the parent route
          return;
        case 'state':
          // continue til we find a route
          break;
        case 'when': {
          let owner = getOwner(this);
          let serviceName = currentScope.parent.name;
          let service = owner.lookup(`service:${serviceName}`);
          if (!service) {
            throw new Error(`ember-constraint-router: couldn't find backing service for ${serviceName}`)
          }

          let val = service.get('routeValidation');
          let validationResult = val[currentScope.desc.condition];

          if (validationResult) {
            if (!service._hasSubscribedToRouteChanges) {
              // let closestRoute = owner.lookup('route:application');
              let closestRoute = transition.handlerInfos[handlerIndex - 1].handler;
              service.addObserver('routeValidation', null, () => {
                closestRoute.refresh();
              });
              service._hasSubscribedToRouteChanges = true;
            }
          } else {
            let alternatives = currentScope.parent.childScopes.map(cs => {
              if (cs === currentScope) {
                return null;
              }

              let result = val[cs.desc.condition];
              if (result) {
                return cs;
              }
            }).filter(result => result);

            let solution = alternatives[0];
            if (solution) {
              let foundLeafRoute;
              for (let k in solution.childScopeRegistry) {
                let maybeLeafRoute = solution.childScopeRegistry[k];
                if (maybeLeafRoute.type === 'route' && maybeLeafRoute.childScopes.length === 0) {
                  foundLeafRoute = maybeLeafRoute;
                  break;
                }
              }

              if (foundLeafRoute) {
                // whether we have a solution or not, we need to subscribe.
                this.router.transitionTo(foundLeafRoute.name);
              } else {
                // TODO: bubble
                transition.abort();
              }
            } else {
              // TODO: bubble up to some pivot point?
              transition.abort();
            }
          }
          break;
        }
      }
      currentScope = currentScope.parent;
    }
  }
});
