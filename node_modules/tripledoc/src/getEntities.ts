import { BlankNode, NamedNode, Literal, Term } from 'rdf-js';
import { DataFactory, Dataset } from './n3dataset';
import { Reference, isLiteral } from './index';

/*
 * Note: This file is mostly a remnant from when Tripledoc used rdflib.
 *       At some point in time, we should transition from traversing an array of Quads,
 *       to using n3's store and its methods (`getSubjects`, `getPredicates`, etc.),
 *       which should be more performant.
 */

/**
 * @internal This is a utility type for other parts of the code, and not part of the public API.
 */
export type FindEntityInDataset = (
  dataset: Dataset,
  knownEntity1: Reference,
  knownEntity2: Reference,
) => Reference | Literal | BlankNode | null;
/**
 * @internal This is a utility type for other parts of the code, and not part of the public API.
 */
export type FindEntitiesInDataset = (
  dataset: Dataset,
  knownEntity1: Reference | BlankNode,
  knownEntity2: Reference | BlankNode,
) => Array<Reference | Literal | BlankNode>;

/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findSubjectInDataset: FindEntityInDataset = (dataset, predicateRef, objectRef) => {
  return findEntityInDataset(dataset, 'subject', null, predicateRef, objectRef);
}
/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findSubjectsInDataset: FindEntitiesInDataset = (dataset, predicateRef, objectRef) => {
  return findEntitiesInDataset(dataset, 'subject', null, predicateRef, objectRef);
}

/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findPredicateInDataset: FindEntityInDataset = (dataset, subjectRef, objectRef) => {
  return findEntityInDataset(dataset, 'predicate', subjectRef, null, objectRef);
}
/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findPredicatesInDataset: FindEntitiesInDataset = (dataset, subjectRef, objectRef) => {
  return findEntitiesInDataset(dataset, 'predicate', subjectRef, null, objectRef);
}

/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findObjectInDataset: FindEntityInDataset = (dataset, subjectRef, predicateRef) => {
  return findEntityInDataset(dataset, 'object', subjectRef, predicateRef, null);
}
/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export const findObjectsInDataset: FindEntitiesInDataset = (dataset, subjectRef, predicateRef) => {
  return findEntitiesInDataset(dataset, 'object', subjectRef, predicateRef, null);
}

/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export function findEntityInDataset(
  dataset: Dataset,
  type: 'subject' | 'predicate' | 'object',
  subjectRef: null | Reference | BlankNode,
  predicateRef: null | Reference | BlankNode,
  objectRef: null | Reference | BlankNode,
): Reference | Literal | BlankNode | null {
  const targetSubject = subjectRef ? toNode(subjectRef) : null;
  const targetPredicate = predicateRef ? toNode(predicateRef) : null;
  const targetObject = objectRef ? toNode(objectRef) : null;
  const matchingTriples = dataset.match(targetSubject, targetPredicate, targetObject, null).toArray();
  const foundTriple = matchingTriples.find((triple) => (typeof triple[type] !== 'undefined'));

  return (typeof foundTriple !== 'undefined') ? normaliseEntity(foundTriple[type]) : null;
}

/**
 * @internal This is a utility method for other parts of the code, and not part of the public API.
 */
export function findEntitiesInDataset(
  dataset: Dataset,
  type: 'subject' | 'predicate' | 'object',
  subjectRef: null | Reference | BlankNode,
  predicateRef: null | Reference | BlankNode,
  objectRef: null | Reference | BlankNode,
): Array<Reference | Literal | BlankNode> {
  const targetSubject = subjectRef ? toNode(subjectRef) : null;
  const targetPredicate = predicateRef ? toNode(predicateRef) : null;
  const targetObject = objectRef ? toNode(objectRef) : null;
  const matchingTriples = dataset.match(targetSubject, targetPredicate, targetObject, null).toArray();
  const foundTriples = matchingTriples.filter((triple) => (typeof triple[type] !== 'undefined'));

  return foundTriples.map(triple => normaliseEntity(triple[type])).filter(isEntity);
}

function toNode(referenceOrBlankNode: Reference | BlankNode): Term {
  return (typeof referenceOrBlankNode === 'string') ? DataFactory.namedNode(referenceOrBlankNode) : referenceOrBlankNode;
}

function normaliseEntity(entity: Term): Reference | Literal | BlankNode | null {
  if (isBlankNode(entity)) {
    return entity;
  }
  if (isNamedNode(entity)) {
    return entity.value;
  }
  /* istanbul ignore else: All code paths to here result in either a Node or a Literal, so we can't test it */
  if (isLiteral(entity)) {
    return entity;
  }
  /* istanbul ignore next: All code paths to here result in either a Node or a Literal, so we can't test it */
  return null;
}
function isEntity(node: Reference | Literal | BlankNode | null): node is Reference | Literal {
  return (node !== null);
}

/**
 * @internal Utility function for working with N3, which the library consumer should not need to
 *           be exposed to.
 */
function isNamedNode(node: Term): node is NamedNode {
  return node.termType === 'NamedNode';
}

/**
 * @internal Utility function for working with rdflib, which the library consumer should not need to
 *           be exposed to.
 */
function isBlankNode(node: Term): node is BlankNode {
  return node.termType === 'BlankNode';
}
