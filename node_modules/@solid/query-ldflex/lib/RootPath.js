"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRootPath;

var _ldflex = require("ldflex");

var _context = _interopRequireDefault(require("@solid/context"));

var _PutHandler = _interopRequireDefault(require("./handlers/PutHandler"));

var _SolidDeleteFunctionHandler = _interopRequireDefault(require("./handlers/SolidDeleteFunctionHandler"));

var _FindActivityHandler = _interopRequireDefault(require("./handlers/FindActivityHandler"));

var _CreateActivityHandler = _interopRequireDefault(require("./handlers/CreateActivityHandler"));

var _DeleteActivityHandler = _interopRequireDefault(require("./handlers/DeleteActivityHandler"));

var _SourcePathHandler = _interopRequireDefault(require("./handlers/SourcePathHandler"));

var _UserPathHandler = _interopRequireDefault(require("./handlers/UserPathHandler"));

var _ContextResolver = _interopRequireDefault(require("./resolvers/ContextResolver"));

var _SubjectPathResolver = _interopRequireDefault(require("./resolvers/SubjectPathResolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  as
} = _context.default['@context'];
const contextResolver = new _ContextResolver.default(_context.default); // Handlers for subject paths

const subjectHandlers = { ..._ldflex.defaultHandlers,
  // HTTP PUT handler
  put: new _PutHandler.default(),
  // Custom delete handler to match node-solid-server behavior
  delete: new _SolidDeleteFunctionHandler.default(),
  // Find activities
  findActivity: new _FindActivityHandler.default(),
  likes: (_, path) => path.findActivity(`${as}Like`),
  dislikes: (_, path) => path.findActivity(`${as}Dislike`),
  follows: (_, path) => path.findActivity(`${as}Follow`),
  // Create activities
  createActivity: new _CreateActivityHandler.default(),
  like: (_, path) => () => path.createActivity(`${as}Like`),
  dislike: (_, path) => () => path.createActivity(`${as}Dislike`),
  follow: (_, path) => () => path.createActivity(`${as}Follow`),
  // Delete activities
  deleteActivity: new _DeleteActivityHandler.default(),
  unlike: (_, path) => () => path.deleteActivity(`${as}Like`),
  undislike: (_, path) => () => path.deleteActivity(`${as}Dislike`),
  unfollow: (_, path) => () => path.deleteActivity(`${as}Follow`)
}; // Creates an LDflex for Solid root path with the given settings

function createRootPath(defaultSettings) {
  let rootPath = null; // Factory for data paths that start from a given subject

  const subjectPathFactory = new _ldflex.PathFactory({
    handlers: { ...subjectHandlers,
      root: () => rootPath
    },
    resolvers: [contextResolver]
  }); // Root path that resolves the first property access

  rootPath = new _ldflex.PathFactory({
    // Handlers of specific named properties
    handlers: { ..._ldflex.defaultHandlers,
      // The `from` function takes a source as input
      from: new _SourcePathHandler.default(subjectPathFactory),
      // The `user` property starts a path with the current user as subject
      user: new _UserPathHandler.default(subjectPathFactory),
      // Clears the cache for the given document (or everything, if undefined)
      clearCache: ({
        settings
      }) => doc => settings.createQueryEngine().clearCache(doc),
      // Expose the JSON-LD context
      context: contextResolver
    },
    // Resolvers for all remaining properties
    resolvers: [// `data[url]` starts a path with the property as subject
    new _SubjectPathResolver.default(subjectPathFactory)],
    ...defaultSettings
  }).create();
  return rootPath;
}