"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RootPath = _interopRequireDefault(require("../RootPath"));

var _SolidUpdateEngine = _interopRequireDefault(require("../SolidUpdateEngine"));

var _comunica = _interopRequireDefault(require("@ldflex/comunica"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Export the root path with Comunica as query engine
var _default = new _RootPath.default({
  createQueryEngine: sources => new _SolidUpdateEngine.default(sources, new _comunica.default(sources))
});

exports.default = _default;