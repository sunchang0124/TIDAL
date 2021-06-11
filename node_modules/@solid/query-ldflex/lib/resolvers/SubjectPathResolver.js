"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dataModel = require("@rdfjs/data-model");

/**
 * LDflex property resolver that returns a new path
 * starting from the property name as a subject.
 *
 * For example, when triggered as
 *     data['http://person.example/#me'].friends.firstName
 * it will create a path with `http://person.example/#me` as subject
 * and then resolve `friends` and `firstName` against the JSON-LD context.
 *
 * In case a source object is given as input, data will be pulled from there.
 */
class SubjectPathResolver {
  constructor(pathFactory, source) {
    this._paths = pathFactory;
    this._source = source;
  }
  /** Resolve all string properties (not Symbols) */


  supports(property) {
    return typeof property === 'string';
  }

  resolve(property, {
    settings
  }) {
    return this._createSubjectPath((0, _dataModel.namedNode)(property), settings);
  }

  _createSubjectPath(subject, {
    createQueryEngine
  }) {
    const source = this._source || Promise.resolve(subject).catch(() => null);
    const queryEngine = createQueryEngine(source);
    return this._paths.create({
      queryEngine
    }, {
      subject
    });
  }

}

exports.default = SubjectPathResolver;