import { helper } from "@ember/component/helper";

export function jsonStringify(params, hash) {
  if (hash.pretty) {
    return JSON.stringify(params[0], null, 2);
  } else {
    return JSON.stringify(params[0]);
  }
}

export default helper(jsonStringify);
