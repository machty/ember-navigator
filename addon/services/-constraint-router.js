import Service from '@ember/service';
import Ember from 'ember';

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

    // let owner = getOwner(this);
    // let emberRouter = owner.lookup('router:main');
    // let dsl = emberRouter._buildDSL();
    // let dslCallbacks = emberRouter.constructor.dslCallbacks || [function() {}];

    // dsl.route(
    //   'application',
    //   { path: '/', resetNamespace: true, overrideNameAssertion: true },
    //   function() {
    //     for (let i = 0; i < dslCallbacks.length; i++) {
    //       dslCallbacks[i].call(this);
    //     }
    //   }
    // );
    // debugger;

    // let res = dsl.generate();
    // res(function() {
    //   debugger;
    // })

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

  // lookupRouteByScope(scope) {
  //   let scopeName = scope.name;
  //   if (scopeName in this._scopeNameToRoute) {
  //     return this._scopeNameToRoute[scopeName];
  //   }

  //   // TODO: full support for resetNamespace and long names.
  //   let scope = this.map.getScope(shortName);
  //   this._mapScopeRegistry[routeGuid] = scope;
  //   return scope;
  // },

  routeWillLoad(route, transition) {
    // on the router side of things, this is the only hook we need
    // to detect things and revalidate. the plan:
    //
    // 1. there might already be an activeTransition, e.g.
    //    the user has already clicked away and THEN something
    //    invalidates, and we need to detect that; we should ideally
    //    try and let the original transition try to run to completion
    //    IF it is within the bounds of hard state constraints. So the 
    //    rule is: don't get in the way of running / valid router transitions.
    //    but if the router is settled and there are no transitions then we
    //    need to revalidate and put the on the correct path.
    // 2. naive version of this algorithm, revalidate from the parent down.
    //    look at resolved models and all the known states. 


    let startScope = this.lookupMapScope(route);

    if (!startScope) {
      // TODO: when would this be considered an error?
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
          break;
        case 'state':
          // continue til we find a route
          break;
        case 'when':
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
              let closestRoute = transition.handlerInfos[handlerIndex-1].handler;
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
      currentScope = currentScope.parent;
    }
  }
});
