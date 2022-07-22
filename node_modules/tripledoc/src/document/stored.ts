import { Reference, isReference } from '..';
import { update } from '../pod';
import { findSubjectInDataset, findSubjectsInDataset, FindEntityInDataset, FindEntitiesInDataset, findEntitiesInDataset } from '../getEntities';
import { Dataset } from '../n3dataset';
import { SubjectCache, DocumentMetadata, TripleDocument, getPendingChanges, instantiateDocument } from '../document';
import { instantiateLocalTripleDocument } from "./local";

/**
 * @internal
 */
export function instantiateFullTripleDocument(dataset: Dataset, subjectCache: SubjectCache, metadata: DocumentMetadata & {
  existsOnPod: true;
  documentRef: Reference;
}): TripleDocument {
  const tripleDocumentWithRef = instantiateLocalTripleDocument(dataset, subjectCache, metadata);

  const getAclRef: () => Reference | null = () => {
    return metadata.aclRef || null;
  };

  const getWebSocketRef: () => Reference | null = () => {
    return metadata.webSocketRef || null;
  };

  const removeSubject = (subjectRef: Reference) => {
    const subject = subjectCache.getSubject(subjectRef);
    return subject.clear();
  };

  const findSubject = (predicateRef: Reference, objectRef: Reference) => {
    const findSubjectRef = withDocumentSingular(findSubjectInDataset, dataset);
    const subjectRef = findSubjectRef(predicateRef, objectRef);
    if (!subjectRef || !isReference(subjectRef)) {
      return null;
    }
    return subjectCache.getSubject(subjectRef);
  };

  const findSubjects = (predicateRef: Reference, objectRef: Reference) => {
    const findSubjectRefs = withDocumentPlural(findSubjectsInDataset, dataset);
    const subjectRefs = findSubjectRefs(predicateRef, objectRef);
    return subjectRefs.filter(isReference).map(subjectCache.getSubject);
  };

  const getAllSubjects = () => {
    const allSubjectRefsInTriples = findEntitiesInDataset(dataset, 'subject', null, null, null)
      .filter(isReference);

    const uniqueSubjectRefs = Array.from(new Set(allSubjectRefsInTriples));

    return uniqueSubjectRefs.map(subjectRef => subjectCache.getSubject(subjectRef));
  };

  const getAllSubjectsOfType = (typeRef: Reference) => {
    return findSubjects('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', typeRef);
  };

  const save = async (subjects = Object.values(subjectCache.getAccessedSubjects())) => {
    const pendingChanges = getPendingChanges(subjects, tripleDocument, dataset);

    let updatedMetadata: DocumentMetadata & {
      existsOnPod: true;
      documentRef: Reference;
    };

    const response = await update(metadata.documentRef, pendingChanges.allDeletions, pendingChanges.allAdditions);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    updatedMetadata = { ...metadata, existsOnPod: true };
    // Instantiate a new TripleDocument that includes the updated Triples:
    return instantiateDocument(pendingChanges.newTriples, updatedMetadata);
  };

  const getStore = () => dataset;
  const getTriples = () => dataset.toArray();

  const tripleDocument: TripleDocument = {
    ...tripleDocumentWithRef,
    save: save,
    removeSubject: removeSubject,
    getSubject: subjectCache.getSubject,
    getAllSubjectsOfType: getAllSubjectsOfType,
    findSubject: findSubject,
    findSubjects: findSubjects,
    getAclRef: getAclRef,
    getWebSocketRef: getWebSocketRef,
    // Experimental methods:
    experimental_getAllSubjects: getAllSubjects,
    // Escape hatches, should not be necessary:
    getStore: getStore,
    getTriples: getTriples,
    // Deprecated aliases, included for backwards compatibility:
    getAcl: getAclRef,
    getStatements: getTriples,
    getSubjectsOfType: getAllSubjectsOfType,
  };

  // Make sure that when TripleSubjects get initialised for this Document,
  // they're attached to the fully initialised Document instance:
  subjectCache.setDocument(tripleDocument);
  return tripleDocument;
}

const withDocumentSingular = (
  getEntityFromTriples: FindEntityInDataset,
  dataset: Dataset,
) => {
  return (knownEntity1: Reference, knownEntity2: Reference) =>
    getEntityFromTriples(dataset, knownEntity1, knownEntity2);
};
const withDocumentPlural = (
  getEntitiesFromTriples: FindEntitiesInDataset,
  dataset: Dataset,
) => {
  return (knownEntity1: Reference, knownEntity2: Reference) =>
    getEntitiesFromTriples(dataset, knownEntity1, knownEntity2);
};
