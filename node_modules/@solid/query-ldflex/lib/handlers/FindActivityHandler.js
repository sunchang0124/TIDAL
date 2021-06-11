"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ActivityHandler = _interopRequireDefault(require("./ActivityHandler"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import './activity.sparql' */
const queryTemplate = "SELECT ?activity WHERE {\n  ?activity a _:type;\n      <https://www.w3.org/ns/activitystreams#actor> _:actor;\n      <https://www.w3.org/ns/activitystreams#object> _:object.\n}\n";

/**
 * Handler that finds an activity in the user's data pod
 * Requires:
 * - the `root.user` handler
 * - the `root[...]` resolver
 * - a queryEngine property in the path settings
 */
class FindActivityHandler extends _ActivityHandler.default {
  constructor(...args) {
    super(...args);
    this.requireUser = false;
  }

  // Finds all activities in the document matching the given pattern
  async *createResults(activity, document, queryEngine) {
    const query = (0, _util.replaceVariables)(queryTemplate, activity);

    for await (const binding of queryEngine.execute(query, document)) yield binding.values().next().value;
  }

}

exports.default = FindActivityHandler;