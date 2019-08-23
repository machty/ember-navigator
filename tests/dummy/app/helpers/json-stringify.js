import { helper } from '@ember/component/helper';

export function jsonStringify(params/*, hash*/) {
  return JSON.stringify(params[0]);
}

export default helper(jsonStringify);
