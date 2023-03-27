import { helper } from '@ember/component/helper';

// See https://stackoverflow.com/a/53731154/914123
// this is needed because `focusedChildNode` causes a circular reference
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function jsonStringify(params, hash) {
  if (hash.pretty) {
    // return JSON.stringify(params[0], getCircularReplacer(), 2);
    return JSON.stringify(params[0], null, 2);
  } else {
    return JSON.stringify(params[0], null);
  }
}

export default helper(jsonStringify);
