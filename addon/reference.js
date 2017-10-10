function getPath(obj, parts) {
  let o = obj;
  for (let key of parts) {
    if (!o) {
      break;
    }
    o = o[key];
  }
  return o;
}

export default class Reference {
  constructor(pathArray) {
    this.path = pathArray;
  }

  value(obj) {
    return getPath(obj, this.path);
  }
}
