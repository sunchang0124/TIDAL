import { Quad } from 'rdf-js';
import SolidAuthClient from 'solid-auth-client';
import { triplesToTurtle } from './turtle';
import { Reference } from '.';

/**
 * Utility function that gets Triples located at a URL
 *
 * @param url Location of the Document contains the Triples.
 * @returns Promise that resolves with the Triples
 * @internal Should not be used by library consumers directly.
 */
/* istanbul ignore next Just a thin wrapper around solid-auth-client, yet cumbersome to test due to side effects */
export async function get(url: string) {
  const response = await SolidAuthClient.fetch(url, {
    headers: {
      Accept: 'text/turtle',
    },
  });

  return response;
}

/**
 * Utility function that gets a URL's metadata
 *
 * @param url Location of the Document to get the metadata of
 * @returns Promise that resolves with the Response
 * @internal Should not be used by library consumers directly.
 */
/* istanbul ignore next Just a thin wrapper around solid-auth-client, yet cumbersome to test due to side effects */
export async function head(url: string) {
  const response = await SolidAuthClient.fetch(url, {
    method: 'HEAD',
  });

  return response;
}

/**
 * Utility function that sends a PATCH request to the Pod to update a Document
 *
 * @param url Location of the Document that contains the Triples to delete, and should have the Triples to add.
 * @param triplesToDelete Triples currently present on the Pod that should be deleted.
 * @param triplesToAdd Triples not currently present on the Pod that should be added.
 * @returns Promise that resolves when the update was executed successfully, and rejects if not.
 * @internal Should not be used by library consumers directly.
 */
/* istanbul ignore next Just a thin wrapper around solid-auth-client, yet cumbersome to test due to side effects */
export async function update(url: Reference, triplesToDelete: Quad[], triplesToAdd: Quad[]) {
  const rawTriplesToDelete = await triplesToTurtle(triplesToDelete);
  const rawTriplesToAdd = await triplesToTurtle(triplesToAdd);
  const deleteStatement = (triplesToDelete.length > 0)
    ? `DELETE DATA {${rawTriplesToDelete}};`
    : '';
  const insertStatement = (triplesToAdd.length > 0)
    ? `INSERT DATA {${rawTriplesToAdd}};`
    : '';
  const response = await SolidAuthClient.fetch(url, {
    method: 'PATCH',
    body: `${deleteStatement} ${insertStatement}`,
    headers: {
      'Content-Type': 'application/sparql-update',
    },
  });
  return response;
}

/**
 * Utility function that sends a PUT request to the Pod to create a new Document
 *
 * @param url URL of the Document that should be created.
 * @param triplesToAdd Triples that should be added to the Document.
 * @returns Promise that resolves with the response when the Document was created successfully, and rejects if not.
 * @internal Should not be used by library consumers directly.
 */
/* istanbul ignore next Just a thin wrapper around solid-auth-client, yet cumbersome to test due to side effects */
export async function create(url: Reference, triplesToAdd: Quad[]): Promise<Response> {
  const rawTurtle = await triplesToTurtle(triplesToAdd);
  const response = await SolidAuthClient.fetch(url, {
    method: 'PUT',
    body: rawTurtle,
    headers: {
      'Content-Type': 'text/turtle',
      'If-None-Match': '*',
    },
  });
  return response;
}

/**
 * Utility function that sends a POST request to a Container in the Pod to create a new Document
 *
 * @param containerUrl URL of the Container in which the Document should be created.
 * @param triplesToAdd Triples that should be added to the Document.
 * @returns Promise that resolves with the response when the Document was created successfully, and rejects if not.
 * @internal Should not be used by library consumers directly.
 */
/* istanbul ignore next Just a thin wrapper around solid-auth-client, yet cumbersome to test due to side effects */
export async function createInContainer(
  containerUrl: Reference,
  triplesToAdd: Quad[],
  options: { slugSuggestion?: string } = {}
): Promise<Response> {
  const rawTurtle = await triplesToTurtle(triplesToAdd);
  const headers: Record<string, string> = {
    'Content-Type': 'text/turtle',
  };
  if (options.slugSuggestion){
    headers.slug = options.slugSuggestion;
  }
  const response = await SolidAuthClient.fetch(containerUrl, {
    method: 'POST',
    body: rawTurtle,
    headers: headers,
  });
  return response;
}
