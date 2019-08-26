export default function invariant(condition: any, format: string, a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = 'Invariant Violation';
    }

    (error as any).framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}
