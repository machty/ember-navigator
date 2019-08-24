import { test, module } from 'ember-qunit';
import { NavStack } from 'ember-constraint-router/-private/nav-stack/nav-stack'
import Ember from 'ember';
import { route, stackNavigator, MapNode } from 'ember-constraint-router/map';

let routerMap = stackNavigator('root', [
  route('normal'),
  route('diff_path', { path: 'custom_path' }),
  route('dynamic_route', { path: 'foo/:fun_id' }),
]);

class StatefulNode {
  mapNode: MapNode;

  constructor(mapNode: MapNode) {
    this.mapNode = mapNode;
  }
}

class Router {
  routes: { [k: string]: StatefulNode };

  constructor(rootNode: MapNode) {
    this.routes = {};
    this.buildRoutes(rootNode);
  }

  buildRoutes(node: MapNode) {
    node.children.forEach(n => this.buildRoutes(n))
    debugger;
    if (this.routes[node.name]) {
      throw new Error(`Encountered duplicate route named ${node.name}. Non-unique route names are not supported at this time`);
    }
    this.routes[node.name] = new StatefulNode(node);
  }
}

module('Unit - Router test');

test("it doesn't yet support non-unique route names", function (assert) {
  assert.raises(() => {
    new Router(
      stackNavigator('root', [
        route('foo'),
        stackNavigator('inner', [
          route('foo'),
        ]),
      ])
    );
  }, /Encountered duplicate route named foo/)
});
