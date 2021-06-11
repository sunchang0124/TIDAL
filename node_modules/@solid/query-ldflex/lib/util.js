"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replaceVariables = replaceVariables;
exports.asList = asList;
exports.termToString = void 0;

var _ldflex = require("ldflex");

const {
  termToString
} = _ldflex.SparqlHandler.prototype;
exports.termToString = termToString;

function replaceVariables(template, terms) {
  for (const name in terms) template = template.replace(new RegExp(`_:${name}`, 'g'), termToString(terms[name]));

  return template;
} // Transforms the arguments into an Immutable.js-style list


function asList(...items) {
  return {
    size: items.length,
    values: () => ({
      next: () => ({
        value: items.shift()
      })
    })
  };
}