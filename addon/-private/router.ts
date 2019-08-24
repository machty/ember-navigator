import { Routeable } from "../map"

class StatefulNode {
  Routeable: Routeable;

  constructor(Routeable: Routeable) {
    this.Routeable = Routeable;
  }
}


// let routerMap = stackNavigator('root', [
//   route('normal'),
//   route('diff_path', { path: 'custom_path' }),
//   route('dynamic_route', { path: 'foo/:fun_id' }),
// ]);


let o = {
  root: {
  }
}

export class Router {
  routes: { [k: string]: StatefulNode };

  constructor(rootNode: Routeable) {
    this.routes = {};
    this.buildRoutes(rootNode);
  }

  buildRoutes(node: Routeable) {
    node.children.forEach(n => this.buildRoutes(n))
    if (this.routes[node.name]) {
      throw new Error(`Encountered duplicate route named ${node.name}. Non-unique route names are not supported at this time`);
    }
    this.routes[node.name] = new StatefulNode(node);
  }

  buildInitialState() {
    return { activeNode: null };
  }

  navigate() {
    let state = { activeNode: null };





  }

  // navigate() {

  // }
}
