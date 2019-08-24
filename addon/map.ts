export type MapNode = {
  name: string;
  children: MapNode[];
};

export type RouteOptions = {
}

class RouteNode implements MapNode {
  name: string;
  children: MapNode[];
  options: RouteOptions;

  constructor(name: string, options: RouteOptions) {
    this.name = name;
    this.children = [];
    this.options = options;
  }
}

export function route(name: string, options: RouteOptions = {}) : MapNode {
  return new RouteNode(name, options);
}

export type StackOptions = {
}

class StackNode implements MapNode {
  name: string;
  children: MapNode[];
  options: StackOptions;

  constructor(name: string, children: MapNode[], options: StackOptions) {
    this.name = name;
    this.children = children;
    this.options = options;
  }
}

export function stackNavigator(name: string, nodes: MapNode[], options: StackOptions = {}) : MapNode {
  return new StackNode(name, nodes, options)
}
