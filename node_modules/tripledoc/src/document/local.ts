import { Reference } from '..';
import { create } from '../pod';
import { Dataset } from '../n3dataset';
import { SubjectCache, DocumentMetadata, LocalTripleDocumentWithRef, instantiateBareTripleDocument, getPendingChanges, extractAclRef, instantiateDocument } from '../document';

/**
 * @internal
 */
export function instantiateLocalTripleDocument(dataset: Dataset, subjectCache: SubjectCache, metadata: DocumentMetadata & {
  documentRef: Reference;
}): LocalTripleDocumentWithRef {
  const bareTripleDocument = instantiateBareTripleDocument(subjectCache, metadata);

  const asRef = () => metadata.documentRef;

  const save = async (subjects = Object.values(subjectCache.getAccessedSubjects())) => {
    const pendingChanges = getPendingChanges(subjects, tripleDocumentWithRef, dataset);

    let updatedMetadata: DocumentMetadata & {
      existsOnPod: true;
      documentRef: Reference;
    };

    const response = await create(metadata.documentRef, pendingChanges.allAdditions);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    updatedMetadata = {
      ...metadata,
      existsOnPod: true,
    };

    const aclRef = extractAclRef(response, metadata.documentRef);
    if (aclRef) {
      updatedMetadata.aclRef = aclRef;
    }

    const webSocketRef = response.headers.get('Updates-Via');
    if (webSocketRef) {
      updatedMetadata.webSocketRef = webSocketRef;
    }

    // Instantiate a new TripleDocument that includes the updated Triples:
    return instantiateDocument(pendingChanges.newTriples, updatedMetadata);
  };

  const tripleDocumentWithRef: LocalTripleDocumentWithRef = {
    ...bareTripleDocument,
    save: save,
    asRef: asRef,
    // Deprecated alias:
    asNodeRef: asRef,
  };

  // Make sure that when TripleSubjects get initialised for this Document,
  // they're attached to the Document instance that includes its Reference:
  subjectCache.setDocument(tripleDocumentWithRef);
  return tripleDocumentWithRef;
}
