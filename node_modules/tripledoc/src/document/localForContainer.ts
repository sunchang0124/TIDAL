import { Reference } from '..';
import { head, createInContainer } from '../pod';
import { Dataset } from '../n3dataset';
import { SubjectCache, DocumentMetadata, LocalTripleDocumentForContainer, instantiateBareTripleDocument, getPendingChanges, extractAclRef, instantiateDocument } from '../document';

/**
 * @internal
 */
export function instantiateLocalTripleDocumentForContainer(dataset: Dataset, subjectCache: SubjectCache, metadata: DocumentMetadata & {
  containerRef: Reference;
}): LocalTripleDocumentForContainer {
  const bareTripleDocument = instantiateBareTripleDocument(subjectCache, metadata);

  const save = async (subjects = Object.values(subjectCache.getAccessedSubjects())) => {
    const pendingChanges = getPendingChanges(subjects, localTripleDocumentForContainer, dataset);

    let updatedMetadata: DocumentMetadata & {
      existsOnPod: true;
      documentRef: Reference;
    };

    const containerResponse = await createInContainer(metadata.containerRef, pendingChanges.allAdditions);
    const locationHeader = containerResponse.headers.get('Location');
    if (!containerResponse.ok || locationHeader === null) {
      const message = await containerResponse.text();
      throw new Error(message);
    }

    const documentRef = new URL(locationHeader, new URL(metadata.containerRef).origin).href;
    updatedMetadata = {
      ...metadata,
      containerRef: undefined,
      documentRef: documentRef,
      existsOnPod: true,
    };

    const documentResponse = await head(documentRef);

    const aclRef = extractAclRef(documentResponse, documentRef);
    if (aclRef) {
      updatedMetadata.aclRef = aclRef;
    }

    const webSocketRef = documentResponse.headers.get('Updates-Via');
    if (webSocketRef) {
      updatedMetadata.webSocketRef = webSocketRef;
    }

    // Instantiate a new TripleDocument that includes the updated Triples:
    return instantiateDocument(pendingChanges.newTriples, updatedMetadata);
  };

  const localTripleDocumentForContainer: LocalTripleDocumentForContainer = {
    ...bareTripleDocument,
    save: save,
  };

  // Make sure that when TripleSubjects get initialised for this Document,
  // they're attached to this Document instance:
  subjectCache.setDocument(localTripleDocumentForContainer);
  return localTripleDocumentForContainer;
}
