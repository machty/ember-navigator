import { MapNode } from "../map"

class StatefulNode {
  mapNode: MapNode;

  constructor(mapNode: MapNode) {
    this.mapNode = mapNode;
  }
}

export class Router {
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
