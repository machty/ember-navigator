'use strict';

/* eslint-env node */

function AddDynamicScopeAttrs(env) {
  let b = env.syntax.builders;

  let BLACKLIST = [
    'debugger',
    'input',
    'outlet',
    'textarea',
    'yield',
    'if',
    'unless',
    '-with-dynamic-vars',
    '-get-dynamic-var'
  ];

  function addOutletState(node) {
    if (BLACKLIST.indexOf(node.path.original) > -1) return;
    let path = node.path && node.path.original || "";
    if (path.indexOf('-') === -1 && node.hash.pairs.length === 0 && node.params.length === 0) {
      return;
    }

    node.hash.pairs.push(
      b.pair(
        '_scope',
        b.sexpr(
          b.path('-get-dynamic-var'),
          [b.string('outletState')]
        )
      )
    );
  }

  return {
    visitor: {
      MustacheStatement: addOutletState,
      BlockStatement: addOutletState,
      SubExpression(node) {
        if (node.path.original === 'component') {
          addOutletState(node)
        }
      }
    }
  };
}

module.exports = AddDynamicScopeAttrs;
