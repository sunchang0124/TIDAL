"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RootPath = _interopRequireDefault(require("../RootPath"));

var _SolidUpdateEngine = _interopRequireDefault(require("../SolidUpdateEngine"));

var _rdflib = _interopRequireDefault(require("@ldflex/rdflib"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Export the root path with rdflib.js as query engine
var _default = new _RootPath.default({
  createQueryEngine: sources => new _SolidUpdateEngine.default(sources, new _rdflib.default(sources))
});

exports.default = _default;