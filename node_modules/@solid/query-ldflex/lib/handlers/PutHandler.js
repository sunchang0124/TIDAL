"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ldflex = require("ldflex");

var _solidAuthClient = _interopRequireDefault(require("solid-auth-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a document for every result with the given contents.
 * Requires:
 * - the `root[...]` resolver
 */
class PutHandler {
  handle(pathData, path) {
    const {
      root
    } = path; // Return an iterator over the created documents

    return (body = '', contentType = 'text/turtle') => (0, _ldflex.toIterablePromise)(async function* () {
      // Collect all unique URLs from the path
      const urls = new Set();

      for await (const result of path) {
        const match = /^https?:\/\/[^#]+/.exec(result ? result.value : '');
        if (match) urls.add(match[0]);
      } // Create and execute HTTP requests for every URL


      const requests = [...urls].map(url => _solidAuthClient.default.fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType
        },
        body
      }));
      await Promise.all(requests); // Return paths to the created documents

      for (const url of urls) yield root[url];
    });
  }

}

exports.default = PutHandler;