"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ActivityHandler = _interopRequireDefault(require("./ActivityHandler"));

var _util = require("../util");

var _dataModel = require("@rdfjs/data-model");

var _uuid = require("uuid");

var _context = _interopRequireDefault(require("@solid/context"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* babel-plugin-inline-import './activity.ttl' */
const activityTemplate = "_:id a _:type;\n    <https://www.w3.org/ns/activitystreams#actor> _:actor;\n    <https://www.w3.org/ns/activitystreams#object> _:object;\n    <https://www.w3.org/ns/activitystreams#published> _:published.\n";
const {
  xsd
} = _context.default['@context'];
/**
 * Handler that creates an activity in the user's data pod
 * Requires:
 * - the `root.user` handler
 * - the `root[...]` resolver
 * - a queryEngine property in the path settings
 */

class CreateActivityHandler extends _ActivityHandler.default {
  // Creates an activity for insertion in the given document
  async *createResults(activity, document) {
    const id = (0, _dataModel.namedNode)(new URL(`#${(0, _uuid.v4)()}`, document).href);
    const published = (0, _dataModel.literal)(new Date().toISOString(), `${xsd}dateTime`);
    activity = {
      id,
      published,
      ...activity
    };
    const insert = (0, _util.replaceVariables)(activityTemplate, activity);
    yield {
      id,
      insert
    };
  } // Inserts the activities into the document


  async processResults(results, document, queryEngine) {
    const sparql = `INSERT {\n${results.map(r => r.insert).join('')}}`;
    await queryEngine.executeUpdate(sparql, document).next();
    return results.map(r => r.id);
  }

}

exports.default = CreateActivityHandler;