"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ldflex = require("ldflex");

var _dataModel = require("@rdfjs/data-model");

var _context = _interopRequireDefault(require("@solid/context"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  as
} = _context.default['@context'];
/**
 * Base class for handlers that manipulate activities
 * Requires:
 * - the `root.user` handler
 * - the `root[...]` resolver
 * - a queryEngine property in the path settings
 */

class ActivityHandler {
  constructor({
    activitiesPath = '/public/activities'
  } = {}) {
    this.requireUser = true;
    this.activitiesPath = activitiesPath;
  }

  handle(pathData, path) {
    const self = this;
    const {
      root
    } = path;
    const {
      settings: {
        queryEngine
      }
    } = pathData; // Return an iterator over the activity paths

    return (type = `${as}Like`) => (0, _ldflex.toIterablePromise)(async function* () {
      // Only process activities if a user is logged in
      let user;

      try {
        user = await root.user;
      } catch (error) {
        if (self.requireUser) throw error;
        return;
      } // Determine the storage location


      const storage = await root.user.pim$storage;
      const document = new URL(self.activitiesPath, storage || user).href; // Obtain results for every activity on the path

      const results = [];
      const actor = (0, _dataModel.namedNode)(user);
      type = (0, _dataModel.namedNode)(type);

      for await (const object of path) {
        if (object.termType === 'NamedNode') {
          const activity = {
            actor,
            type,
            object
          };

          for await (const result of self.createResults(activity, document, queryEngine)) results.push(result);
        }
      } // Process all results and return paths starting from the returned terms


      for (const term of await self.processResults(results, document, queryEngine)) yield root[term.value];
    });
  }

  async processResults(results) {
    return results;
  }

}

exports.default = ActivityHandler;