var factory = require('@rdfjs/data-model');
var RdfTerm = require('rdf-string');
var toRdfLiteral = require("rdf-literal").toRdf;

module.exports = function(s, p, o, g) {
  return factory.quad(
    RdfTerm.stringToTerm(s),
    RdfTerm.stringToTerm(p),
    typeof o === 'string' ? RdfTerm.stringToTerm(o) : toRdfLiteral(o),
    g ? RdfTerm.stringToTerm(g) : factory.defaultGraph()
  );
};

