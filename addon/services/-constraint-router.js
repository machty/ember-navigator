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
    let handlerInfo = transition.handlerInfos[handlerIndex];
    while (currentScope) {
      if (currentScope.name === 'root') {
        break;
      }

      switch(currentScope.type) {
        case 'route':
          handlerIndex--;
          handlerInfo = transition.handlerInfos[handlerIndex];
          if (!handlerInfo || handlerInfo.name !== currentScope.name) {
            throw new Error(`ember-constraint-router unable to find route while walking tree`);
          }
          break;
        case 'state':
          break;
        case 'when':
          let owner = getOwner(this);

          let validationContext = {
            get: (name) => {
              // TODO: eventually this can be a keyed State builder
              // rather than something that does lookups on a singleton.
              return owner.lookup(`service:${name}`);
            }
          };

          let isValid = currentScope.desc.validatePresence(validationContext);

          if (!isValid) {
            let alternatives = currentScope.parent.childScopes.map(cs => {
              if (cs === currentScope) {
                return null;
              }

              let result = cs.desc.validatePresence(validationContext);
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

    if (transition === this.activeTransition) {
    } else {
      this.activeTransition = transition;
      // this.activeTransition.then(value => {
      //   alert('completed')
      // }, error => {
      //   alert('error')
      // });
    }
    this.lastRouteLoaded = route;
  }
});
