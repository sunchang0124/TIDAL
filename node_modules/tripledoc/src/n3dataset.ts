/**
 * This file wraps N3.js, providing just the RDF/JS interface we need.
 *
 * The N3.js Store does not implement the RDF/JS Dataset interface. However, Tripledoc relies on
 * that interface to be able to potentially use different RDF libraries, supporting e.g. different
 * serialisation formats. Thus, we wrap N3.js in this standardised interface, at least in so far we
 * use it.
 */
import { Dataset as RdfjsDataset, DataFactory as RdfJsDataFactory } from 'rdf-js';
import { N3Store, Store, DataFactory as N3DataFactory } from 'n3';

/**
 * Only the methods of `Dataset` we need.
 *
 * Everywhere this data type is expected, a full-blown RDF/JS Dataset will also be accepted.
 *
 * @ignore For internal use only, although it's exposed as an escape hatch through TripleDocument.getStore().
 */
export type Dataset = {
  addAll: (...params: Parameters<RdfjsDataset['addAll']>) => Dataset;
  match: (...params: Parameters<RdfjsDataset['match']>) => {
    toArray: RdfjsDataset['toArray'];
  };
  toArray: RdfjsDataset['toArray'];
};

/* istanbul ignore next: A simple wrapper to make N3 conform with a subset of the RDF/JS Dataset
                         interface; should contain no business logic. */
function toRdfjsDataset(store: N3Store): Dataset {
  const addAll: Dataset['addAll'] = (quads) => {
    const quadsAsArray = Array.isArray(quads) ? quads : quads.toArray();
    store.addQuads(quadsAsArray);
    return dataset;
  };

  const match: Dataset['match'] = (subject, predicate, object, graph) => {
    const notUndefinedSubject = (typeof subject === 'undefined') ? null : subject;
    const notUndefinedPredicate = (typeof predicate === 'undefined') ? null : predicate;
    const notUndefinedObject = (typeof object === 'undefined') ? null : object;
    const notUndefinedGraph = (typeof graph === 'undefined') ? null : graph;
    return {
      toArray: () => store.getQuads(
        notUndefinedSubject,
        notUndefinedPredicate,
        notUndefinedObject,
        notUndefinedGraph,
      ),
    };
  };

  const toArray: Dataset['toArray'] = () => store.getQuads(null, null, null, null);

  const dataset: Dataset = {
    addAll,
    match,
    toArray,
  };
  return dataset;
}

/**
 * @internal
 */
export function initialiseDataset() {
  return toRdfjsDataset(new Store());
}

/**
 * @internal
 */
export const DataFactory: RdfJsDataFactory = N3DataFactory;
