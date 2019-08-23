export type MapRouteOptions = {
  path?: String;
}

export type MapRoute = {
  name: String;
  options: MapRouteOptions;
}

export type Dsl = {
  name: String;
  options: any;
}

export type Map = MapRoute[];

export function createMap(callback: (this: Dsl) => any) : Map {
  let routes: Map = [];
  callback.call({
    route: (name: String, options = {}) => {
      routes.push({ name, options })
    }
  });
  return routes;
}
