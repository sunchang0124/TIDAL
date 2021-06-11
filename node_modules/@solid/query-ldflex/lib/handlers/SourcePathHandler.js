"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ldflex = require("ldflex");

var _SubjectPathResolver = _interopRequireDefault(require("../resolvers/SubjectPathResolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SourcePathHandler {
  constructor(pathFactory) {
    this._paths = pathFactory;
  }

  handle({
    settings
  }) {
    return source => new _ldflex.PathFactory({
      handlers: { ..._ldflex.defaultHandlers
      },
      resolvers: [new _SubjectPathResolver.default(this._paths, source)]
    }).create(settings, {});
  }

}

exports.default = SourcePathHandler;