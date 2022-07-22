"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ActivityHandler = _interopRequireDefault(require("./ActivityHandler"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import './activity-triples.sparql' */
const queryTemplate = "SELECT ?subject ?predicate ?object WHERE {\n  ?subject a _:type;\n      <https://www.w3.org/ns/activitystreams#actor> _:actor;\n      <https://www.w3.org/ns/activitystreams#object> _:object.\n  ?subject ?predicate ?object.\n}\n";
const components = ['?subject', '?predicate', '?object'];
/**
 * Handler that deletes an activity in the user's data pod
 * Requires:
 * - the `root.user` handler
 * - the `root[...]` resolver
 * - a queryEngine property in the path settings
 */

class DeleteActivityHandler extends _ActivityHandler.default {
  // Finds activity triples for deletion
  async *createResults(activity, document, queryEngine) {
    const query = (0, _util.replaceVariables)(queryTemplate, activity);

    for await (const triple of queryEngine.execute(query, document)) {
      const terms = components.map(c => (0, _util.termToString)(triple.get(c)));
      yield `${terms.join(' ')}.\n`;
    }
  } // Deletes the activity triples from the document


  async processResults(results, document, queryEngine) {
    const sparql = `DELETE {\n${results.join('')}}`;
    await queryEngine.executeUpdate(sparql, document).next();
    return [];
  }

}

exports.default = DeleteActivityHandler;