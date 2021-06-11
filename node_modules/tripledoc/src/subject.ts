import { Literal, BlankNode, Quad } from 'rdf-js';
import { DataFactory } from './n3dataset';
import {
  Reference,
  isLiteral,
  LiteralTypes,
  isReference,
  isStringLiteral,
  isIntegerLiteral,
  isDecimalLiteral,
  DateTimeLiteral,
  isDateTimeLiteral,
  IntegerLiteral,
  DecimalLiteral,
  StringLiteral,
  isBlankNode,
  generateLocaleTypeGuard,
  LocaleStringLiteral,
} from './index';
import { findObjectsInDataset } from './getEntities';
import { BareTripleDocument, isSavedToPod } from './document';
import { initialiseDataset } from './n3dataset';

/**
 * Represents a single Subject in a [[TripleDocument]].
 *
 * Used to read and modify properties of a single Subject in a [[TripleDocument]], using the `get*`,
 * `set*`, `add*` and `remove*` methods for the relevant data types. Note that those changes will
 * not be persisted until you call [[TripleDocument.save]].
 */
export interface TripleSubject {
  /**
   * @returns The [[TripleDocument]] that contains this Subject.
   */
  getDocument: () => BareTripleDocument;
  /**
   * @deprecated
   * @ignore This is mostly a convenience function to make it easy to work with n3 and tripledoc
   *         simultaneously. If you rely on this, it's probably best to either file an issue
   *         describing what you want to do that Tripledoc can't do directly, or to just use n3
   *         directly.
   * @returns The Triples pertaining to this Subject that are stored on the user's Pod. Note that
   *          this does not return Triples that have not been saved yet - see
   *          [[getPendingTriples]] for those.
   */
  getTriples: () => Quad[];
  /**
   * Find a literal string value for `predicate` on this Subject.
   *
   * This retrieves _one_ string literal, or `null` if none is found. If you want to find _all_
   * string literals for a predicate, see [[getAllStrings]].
   *
   * @param getString.predicate Which property of this Subject you want the value of.
   * @returns The first literal string value satisfying `predicate`, if any, and `null` otherwise.
   */
  getString: (predicate: Reference) => string | null;
  /**
   * Find a literal string value in a given locale for `predicate` on this Subject.
   *
   * This retrieves _one_ string literal, or `null` if none (in the given locale) is found. If you
   * want to find _all_ string literals in a locale for a predicate, see [[getAllLocaleStrings]].
   *
   * @param getLocaleString.predicate Which property of this Subject you want the value of.
   * @param getLocaleString.locale Which locale the string should be in, e.g. 'nl-NL'.
   * @returns The first literal string value satisfying `predicate` in the given locale, if any, and `null` otherwise.
   */
  getLocaleString: (predicate: Reference, locale: string) => string | null;
  /**
   * Find a literal integer value for `predicate` on this Subject.
   *
   * This retrieves _one_ integer literal, or `null` if none is found. If you want to find _all_
   * integer literals for a predicate, see [[getAllIntegers]].
   *
   * @param getInteger.predicate Which property of this Subject you want the value of.
   * @returns The first literal integer value satisfying `predicate`, if any, and `null` otherwise.
   */
  getInteger: (predicate: Reference) => number | null;
  /**
   * Find a literal decimal value for `predicate` on this Subject.
   *
   * This retrieves _one_ decimal literal, or `null` if none is found. If you want to find _all_
   * decimal literals for a predicate, see [[getAllDecimals]].
   *
   * @param getDecimal.predicate Which property of this Subject you want the value of.
   * @returns The first literal decimal value satisfying `predicate`, if any, and `null` otherwise.
   */
  getDecimal: (predicate: Reference) => number | null;
  /**
   * Find a literal date+time value for `predicate` on this Subject.
   *
   * This retrieves _one_ date+time literal, or `null` if none is found. If you want to find _all_
   * date+time literals for a predicate, see [[getAllDateTimes]].
   *
   * @param getDateTime.predicate Which property of this Subject you want the value of.
   * @returns The first literal Date value satisfying `predicate`, if any, and `null` otherwise.
   */
  getDateTime: (predicate: Reference) => Date | null;
  /**
   * @param getLiteral.predicate Which property of this Subject you want the value of.
   * @returns The first literal value satisfying `predicate`, if any, and `null` otherwise.
   * @deprecated This method has been superseded by the type-specific methods [[getString]],
   *             [[getInteger]], [[getDecimal]] and [[getDateTime]].
   */
  getLiteral: (predicate: Reference) => LiteralTypes | null;
  /**
   * @param getAllStrings.predicate Which property of this Subject you want the values of.
   * @returns All literal string values satisfying `predicate`.
   */
  getAllStrings: (predicate: Reference) => string[];
  /**
   * @param getAllLocaleStrings.predicate Which property of this Subject you want the values of.
   * @param getAllLocaleStrings.locale Which locale the values should be in, e.g. 'nl-NL'.
   * @returns All literal string values satisfying `predicate` in the given locale.
   */
  getAllLocaleStrings: (predicate: Reference, locale: string) => string[];
  /**
   * @param getAllIntegers.predicate Which property of this Subject you want the values of.
   * @returns All literal integer values satisfying `predicate`.
   */
  getAllIntegers: (predicate: Reference) => number[];
  /**
   * @param getAllDecimals.predicate Which property of this Subject you want the values of.
   * @returns All literal decimal values satisfying `predicate`.
   */
  getAllDecimals: (predicate: Reference) => number[];
  /**
   * @param getAllDateTimes.predicate Which property of this Subject you want the values of.
   * @returns All literal DateTime values satisfying `predicate`.
   */
  getAllDateTimes: (predicate: Reference) => Date[];
  /**
   * @param getAllLiterals.predicate Which property of this Subject you want the values of.
   * @returns All literal values satisfying `predicate`.
   * @deprecated This method has been superseded by the type-specific methods [[getAllStrings]],
   *             [[getAllIntegers]], [[getAllDecimals]] and [[getAllDates]].
   */
  getAllLiterals: (predicate: Reference) => LiteralTypes[];
  /**
   * Find a local Subject (i.e. without its own URL) referenced by this Subject with `predicate`.
   *
   * This retrieves _one_ [[TripleSubject]], or `null` if none is found. If you want to find _all_
   * local Subjects for a predicate, see [[getAllLocalSubjects]].
   *
   * @param getRef.predicate Which property of this Subject you want the value of.
   * @returns The first referenced local Subject satisfying `predicate`, if any, and `null` otherwise.
   * @ignore Experimental API; could change in minor or patch releases.
   */
  getLocalSubject: (predicate: Reference) => TripleSubject | null;
  /**
   * Find local Subject (i.e. without their own URLs) referenced by this Subject with `predicate`.
   *
   * @param getRef.predicate Which property of this Subject you want the values of.
   * @returns All referenced local Subjects satisfying `predicate`.
   * @ignore Experimental API; could change in minor or patch releases.
   */
  getAllLocalSubjects: (predicate: Reference) => Array<TripleSubject>;
  /**
   * Find a reference attached to this Subject with `predicate`.
   *
   * This retrieves _one_ reference, or `null` if none is found. If you want to find _all_
   * references for a predicate, see [[getAllRefs]].
   *
   * @param getRef.predicate Which property of this Subject you want the value of.
   * @returns The first referenced IRI satisfying `predicate`, if any, and `null` otherwise.
   */
  getRef: (predicate: Reference) => Reference | null;
  /**
   * @ignore Deprecated method.
   * @deprecated Replaced by [[getRef]].
   */
  getNodeRef: (predicate: Reference) => Reference | null;
  /**
   * @returns The type of this Subject, if known.
   */
  getType: () => Reference | null;
  /**
   * @param getAllRefs.predicate Which property of this Subject you want the values of.
   * @returns All references satisfying `predicate`.
   */
  getAllRefs: (predicate: Reference) => Array<Reference>;
  /**
   * @ignore Deprecated method.
   * @deprecated Replaced by [[getAllRefs]].
   */
  getAllNodeRefs: (predicate: Reference) => Array<Reference>;
  /**
   * Set a property of this Subject to a Literal string value.
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addString.predicate The property you want to add another value of.
   * @param addString.object The Literal string value you want to add.
   */
  addString: (predicate: Reference, object: string) => void;
  /**
   * Set a property of this Subject to a Literal localised string value.
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addLocaleString.predicate The property you want to add another value of.
   * @param addLocaleString.object The Literal string value you want to add.
   * @param addLocaleString.locale The locale the given string is in.
   */
  addLocaleString: (predicate: Reference, object: string, locale: string) => void;
  /**
   * Set a property of this Subject to a Literal integer value.
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addInteger.predicate The property you want to add another value of.
   * @param addInteger.object The Literal integer value you want to add.
   */
  addInteger: (predicate: Reference, object: number) => void;
  /**
   * Set a property of this Subject to a Literal decimal value.
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addDecimal.predicate The property you want to add another value of.
   * @param addDecimal.object The Literal decimal value you want to add.
   */
  addDecimal: (predicate: Reference, object: number) => void;
  /**
   * Set a property of this Subject to a Literal DateTime value.
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addDateTime.predicate The property you want to add another value of.
   * @param addDateTime.object The Literal DateTime value you want to add.
   */
  addDateTime: (predicate: Reference, object: Date) => void;
  /**
   * Set a property of this Subject to a Literal value (i.e. not a URL).
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addLiteral.predicate The property you want to add another value of.
   * @param addLiteral.object The Literal value you want to add, the type of which is one of [[LiteralTypes]].
   * @deprecated This method has been superseded by the type-specific methods [[addString]],
   *             [[addInteger]], [[addDecimal]] and [[addDateTime]].
   */
  addLiteral: (predicate: Reference, object: LiteralTypes) => void;
  /**
   * Set a property of this Subject to a [[Reference]].
   *
   * Note that this value is not saved to the user's Pod until you save the containing Document.
   *
   * @param addRef.predicate The property you want to add another value of.
   * @param addRef.object The IRI you want to add a reference to.
   */
  addRef: (predicate: Reference, object: Reference) => void;
  /**
   * @ignore Deprecated method.
   * @deprecated Replaced by [[addRef]].
   */
  addNodeRef: (predicate: Reference, object: Reference) => void;
  /**
   * Remove a Literal string value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeString.predicate The property you want to remove a value of.
   * @param removeString.object The Literal string value you want to remove.
   */
  removeString: (predicate: Reference, object: string) => void;
  /**
   * Remove a Literal localised string value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeLocaleString.predicate The property you want to remove a value of.
   * @param removeLocaleString.object The Literal string value you want to remove.
   * @param removeLocaleString.locale The locale of the string to remove.
   */
  removeLocaleString: (predicate: Reference, object: string, locale: string) => void;
  /**
   * Remove a Literal integer value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeInteger.predicate The property you want to remove a value of.
   * @param removeInteger.object The Literal integer value you want to remove.
   */
  removeInteger: (predicate: Reference, object: number) => void;
  /**
   * Remove a Literal decimal value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeDecimal.predicate The property you want to remove a value of.
   * @param removeDecimal.object The Literal decimal value you want to remove.
   */
  removeDecimal: (predicate: Reference, object: number) => void;
  /**
   * Remove a Literal DateTime value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeDateTime.predicate The property you want to remove a value of.
   * @param removeDateTime.object The Literal DateTime value you want to remove.
   */
  removeDateTime: (predicate: Reference, object: Date) => void;
  /**
   * Remove a Literal value for a property of this Subject.
   *
   * Note that this value is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeLiteral.predicate The property you want to remove a value of.
   * @param removeLiteral.object The Literal value you want to remove, the type of which is one of [[LiteralTypes]].
   * @deprecated This method has been superseded by the type-specific methods [[removeString]],
   *             [[removeInteger]], [[removeDecimal]] and [[removeDateTime]].
   */
  removeLiteral: (predicate: Reference, object: LiteralTypes) => void;
  /**
   * Remove a [[Reference]] value for a property of this Subject.
   *
   * Note that this pointer is not removed from the user's Pod until you save the containing Document.
   *
   * @param removeRef.predicate The property you want to remove a reference for.
   * @param removeRef.object The reference you want to remove.
   */
  removeRef: (predicate: Reference, object: Reference) => void;
  /**
   * @ignore Deprecated.
   * @deprecated Replaced by [[removeRef]].
   */
  removeNodeRef: (predicate: Reference, object: Reference) => void;
  /**
   * Remove all values for a property of this Subject.
   *
   * Note that these values are not removed from the user's Pod until you save the containing
   * Document.
   *
   * @param removeAll.predicate The property you want to remove the values of.
   */
  removeAll: (predicate: Reference) => void;
  /**
   * Set a property of this Subject to a string Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setString.predicate The property you want to set the value of.
   * @param setString.object The string Literal value you want to set.
   */
  setString: (predicate: Reference, object: string) => void;
  /**
   * Set a property of this Subject to a localised string Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setLocaleString.predicate The property you want to set the value of.
   * @param setLocaleString.object The string Literal value you want to set.
   * @param setLocaleString.locale The locale of the given string.
   */
  setLocaleString: (predicate: Reference, object: string, locale: string) => void;
  /**
   * Set a property of this Subject to an integer Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setInteger.predicate The property you want to set the value of.
   * @param setInteger.object The integer Literal value you want to set.
   */
  setInteger: (predicate: Reference, object: number) => void;
  /**
   * Set a property of this Subject to a decimal Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setDecimal.predicate The property you want to set the value of.
   * @param setDecimal.object The decimal Literal value you want to set.
   */
  setDecimal: (predicate: Reference, object: number) => void;
  /**
   * Set a property of this Subject to a DateTime Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setDateTime.predicate The property you want to set the value of.
   * @param setDateTime.object The DateTime Literal value you want to set.
   */
  setDateTime: (predicate: Reference, object: Date) => void;
  /**
   * Set a property of this Subject to a Literal value, clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setLiteral.predicate The property you want to set the value of.
   * @param setLiteral.object The Literal value you want to set, the type of which is one of [[LiteralTypes]].
   * @deprecated This method has been superseded by the type-specific methods [[setString]],
   *             [[setInteger]], [[setDecimal]] and [[setDateTime]].
   */
  setLiteral: (predicate: Reference, object: LiteralTypes) => void;
  /**
   * Set a property of this Subject to a [[Reference]], clearing all existing values.
   *
   * Note that this change is not saved to the user's Pod until you save the containing Document.
   *
   * @param setRef.predicate The property you want to set the value of.
   * @param setRef.object The reference you want to add.
   */
  setRef: (predicate: Reference, object: Reference) => void;
  /**
   * @ignore Deprecated.
   * @deprecated Replaced by [[setRef]].
   */
  setNodeRef: (predicate: Reference, object: Reference) => void;
  /**
   * Unset all values for all Predicates of this Subject.
   *
   * @internal Currently an internal API for use by [[TripleDocument]].
   */
  clear: () => void;
  /**
   * @internal Pending Triples are only provided so the Document can access them in order to save
   *           them - this is not part of the public API and can thus break in a minor release.
   * @returns A tuple with the first element being a list of Triples that should be deleted from
   *          the store, and the second element a list of Triples that should be added to it.
   */
  getPendingTriples: () => [Quad[], Quad[]];
  /**
   * Get the IRI of the [[Reference]] representing this specific Subject.
   *
   * @returns The IRI of this specific Subject.
   */
  asRef: () => Reference;
  /**
   * @ignore Deprecated.
   * @deprecated Replaced by [[asRef]].
   */
  asNodeRef: () => Reference;
};

/**
 * @internal Only to be called by the Document containing this subject; not a public API.
 * @param document The Document this Subject is defined in.
 * @param subjectRef The URL that identifies this subject.
 */
export function initialiseSubject(document: BareTripleDocument, subjectRef: Reference| BlankNode): TripleSubject {
  const subjectNode = isBlankNode(subjectRef) ? subjectRef : DataFactory.namedNode(subjectRef);
  const triples = (isSavedToPod(document))
    ? document.getStore().match(subjectNode, null, null, null).toArray()
    : [];
  const dataset = initialiseDataset();
  dataset.addAll(triples);
  let pendingAdditions: Quad[] = [];
  let pendingDeletions: Quad[] = [];

  const get = (predicateNode: Reference) => findObjectsInDataset(dataset, subjectRef, predicateNode);
  const getString = (predicateNode: Reference) => {
    const objects = get(predicateNode);
    const firstStringLiteral = objects.find(isStringLiteral);
    if (typeof firstStringLiteral === 'undefined') {
      return null;
    }
    return firstStringLiteral.value;
  };
  const getLocaleString = (predicateNode: Reference, locale: string) => {
    const objects = get(predicateNode);
    const firstStringLiteral = objects.find(generateLocaleTypeGuard(locale));
    if (typeof firstStringLiteral === 'undefined') {
      return null;
    }
    return firstStringLiteral.value;
  };
  const getInteger = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstIntegerLiteral = objects.find(isIntegerLiteral);
    if (typeof firstIntegerLiteral === 'undefined') {
      return null;
    }

    return fromIntegerLiteral(firstIntegerLiteral);
  };
  const getDecimal = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstDecimalLiteral = objects.find(isDecimalLiteral);
    if (typeof firstDecimalLiteral === 'undefined') {
      return null;
    }

    return fromDecimalLiteral(firstDecimalLiteral);
  };
  const getDateTime = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstDateTimeLiteral = objects.find(isDateTimeLiteral);
    if (typeof firstDateTimeLiteral === 'undefined') {
      return null;
    }

    return fromDateTimeLiteral(firstDateTimeLiteral);
  };
  const getLiteral = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstLiteral = objects.find(isLiteral);
    if (typeof firstLiteral === 'undefined') {
      return null;
    }
    return fromLiteral(firstLiteral);
  };
  const getAllStrings = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const literals = objects.filter(isStringLiteral);
    return literals.map(fromStringLiteral);
  };
  const getAllLocaleStrings = (predicateRef: Reference, locale: string) => {
    const objects = get(predicateRef);
    const literals = objects.filter(generateLocaleTypeGuard(locale));
    return literals.map(fromStringLiteral);
  };
  const getAllIntegers = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const literals = objects.filter(isIntegerLiteral);
    return literals.map(fromIntegerLiteral);
  };
  const getAllDecimals = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const literals = objects.filter(isDecimalLiteral);
    return literals.map(fromDecimalLiteral);
  };
  const getAllDateTimes = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const literals = objects.filter(isDateTimeLiteral);
    return literals.map(fromDateTimeLiteral);
  };
  const getAllLiterals = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const literals = objects.filter(isLiteral);
    return literals.map(fromLiteral);
  };
  const getLocalSubject = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstRef = objects.find(isBlankNode);
    if (typeof firstRef === 'undefined') {
      return null;
    }
    return initialiseSubject(document, firstRef);
  };
  const getAllLocalSubjects = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const nodeRefs = objects.filter(isBlankNode);
    return nodeRefs.map((localSubject: BlankNode) => initialiseSubject(document, localSubject));
  };
  const getRef = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const firstRef = objects.find(isReference);
    if (typeof firstRef === 'undefined') {
      return null;
    }
    return firstRef;
  };
  const getAllRefs = (predicateRef: Reference) => {
    const objects = get(predicateRef);
    const nodeRefs = objects.filter(isReference);
    return nodeRefs;
  };

  const getType = () => {
    return getRef('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  }

  const addLiteral = (predicateRef: Reference, literal: LiteralTypes) => {
    pendingAdditions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      asLiteral(literal),
    ));
  };
  const addString = (predicateRef: Reference, literal: string) => {
    if (typeof literal !== 'string') {
      throw new Error('The given value is not a string.');
    }
    return addLiteral(predicateRef, literal);
  };
  const addLocaleString = (predicateRef: Reference, literal: string, locale: string) => {
    if (typeof literal !== 'string') {
      throw new Error('The given value is not a string.');
    }
    pendingAdditions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.literal(literal, locale),
    ));
  };
  const addInteger = (predicateRef: Reference, literal: number) => {
    if (typeof literal !== 'number' || !Number.isInteger(literal)) {
      throw new Error('The given value is not an integer.');
    }
    return addLiteral(predicateRef, literal);
  };
  const addDecimal = (predicateRef: Reference, literal: number) => {
    if (typeof literal !== 'number') {
      throw new Error('The given value is not a decimal.');
    }
    pendingAdditions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.literal(literal.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal')),
    ));
  };
  const addDateTime = (predicateRef: Reference, literal: Date) => {
    if (literal instanceof Date === false) {
      throw new Error('The given value is not a DateTime.');
    }
    return addLiteral(predicateRef, literal);
  };
  const addRef = (predicateRef: Reference, nodeRef: Reference) => {
    pendingAdditions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.namedNode(nodeRef),
    ));
  };
  const removeRef = (predicateRef: Reference, nodeRef: Reference) => {
    pendingDeletions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.namedNode(nodeRef),
    ));
  };
  const removeLiteral = (predicateRef: Reference, literal: LiteralTypes) => {
    pendingDeletions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      asLiteral(literal), 
    ));
  };
  const removeString = (predicateRef: Reference, literal: string) => {
    if (typeof literal !== 'string') {
      throw new Error('The given value is not a string.');
    }
    return removeLiteral(predicateRef, literal);
  };
  const removeLocaleString = (predicateRef: Reference, literal: string, locale: string) => {
    if (typeof literal !== 'string') {
      throw new Error('The given value is not a string.');
    }
    pendingDeletions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.literal(literal, locale),
    ));
  };
  const removeInteger = (predicateRef: Reference, literal: number) => {
    if (typeof literal !== 'number' || !Number.isInteger(literal)) {
      throw new Error('The given value is not an integer.');
    }
    return removeLiteral(predicateRef, literal);
  };
  const removeDecimal = (predicateRef: Reference, literal: number) => {
    if (typeof literal !== 'number') {
      throw new Error('The given value is not a decimal.');
    }
    // We cannot re-use `removeLiteral` here because it will parse `42.0` as an integer:
    pendingDeletions.push(DataFactory.triple(
      subjectNode,
      DataFactory.namedNode(predicateRef),
      DataFactory.literal(literal.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal')),
    ));
  };
  const removeDateTime = (predicateRef: Reference, literal: Date) => {
    if (literal instanceof Date === false) {
      throw new Error('The given value is not a DateTime.');
    }
    return removeLiteral(predicateRef, literal);
  };
  const removeAll = (predicateRef: Reference) => {
    pendingDeletions.push(...dataset.match(
      subjectNode, DataFactory.namedNode(predicateRef), null, null,
    ).toArray());
  };
  const clear = () => {
    pendingDeletions.push(...getTriples());
  };
  const setRef = (predicateRef: Reference, nodeRef: Reference) => {
    removeAll(predicateRef);
    addRef(predicateRef, nodeRef);
  };
  const setLiteral = (predicateRef: Reference, literal: LiteralTypes) => {
    removeAll(predicateRef);
    addLiteral(predicateRef, literal);
  };
  const setString = (predicateRef: Reference, literal: string) => {
    removeAll(predicateRef);
    addString(predicateRef, literal);
  };
  const setLocaleString = (predicateRef: Reference, literal: string, locale: string) => {
    removeAll(predicateRef);
    addLocaleString(predicateRef, literal, locale);
  };
  const setInteger = (predicateRef: Reference, literal: number) => {
    removeAll(predicateRef);
    addInteger(predicateRef, literal);
  };
  const setDecimal = (predicateRef: Reference, literal: number) => {
    removeAll(predicateRef);
    addDecimal(predicateRef, literal);
  };
  const setDateTime = (predicateRef: Reference, literal: Date) => {
    removeAll(predicateRef);
    addDateTime(predicateRef, literal);
  };

  const getTriples = () => dataset.match(
    subjectNode,
    null,
    null,
    null,
  ).toArray();

  const asRef = () => isBlankNode(subjectRef) ? subjectRef.value : subjectRef;

  const subject: TripleSubject = {
    getDocument: () => document,
    getTriples: getTriples,
    getString: getString,
    getLocaleString: getLocaleString,
    getInteger: getInteger,
    getDecimal: getDecimal,
    getDateTime: getDateTime,
    getLiteral: getLiteral,
    getAllStrings: getAllStrings,
    getAllLocaleStrings: getAllLocaleStrings,
    getAllIntegers: getAllIntegers,
    getAllDecimals: getAllDecimals,
    getAllDateTimes: getAllDateTimes,
    getAllLiterals: getAllLiterals,
    getLocalSubject: getLocalSubject,
    getAllLocalSubjects: getAllLocalSubjects,
    getRef: getRef,
    getAllRefs: getAllRefs,
    getType: getType,
    addString: addString,
    addLocaleString: addLocaleString,
    addInteger: addInteger,
    addDecimal: addDecimal,
    addDateTime: addDateTime,
    addRef: addRef,
    removeAll: removeAll,
    removeString: removeString,
    removeLocaleString: removeLocaleString,
    removeInteger: removeInteger,
    removeDecimal: removeDecimal,
    removeDateTime: removeDateTime,
    removeRef: removeRef,
    setRef: setRef,
    setString: setString,
    setLocaleString: setLocaleString,
    setInteger: setInteger,
    setDecimal: setDecimal,
    setDateTime: setDateTime,
    clear: clear,
    getPendingTriples: () => [pendingDeletions, pendingAdditions],
    asRef: asRef,
    // Deprecated aliases, included for backwards compatibility:
    getNodeRef: getRef,
    getAllNodeRefs: getAllRefs,
    addNodeRef: addRef,
    addLiteral: addLiteral,
    removeNodeRef: removeRef,
    removeLiteral: removeLiteral,
    setNodeRef: setRef,
    setLiteral: setLiteral,
    asNodeRef: asRef,
  };

  return subject;
}

function fromDateTimeLiteral(literal: DateTimeLiteral): Date {
  // See https://github.com/linkeddata/rdflib.js/blob/d84af88f367b8b5f617c753d8241c5a2035458e8/src/literal.js#L87
  const utcFullYear = parseInt(literal.value.substring(0, 4), 10);
  const utcMonth = parseInt(literal.value.substring(5, 7), 10) - 1;
  const utcDate = parseInt(literal.value.substring(8, 10), 10);
  const utcHours = parseInt(literal.value.substring(11, 13), 10);
  const utcMinutes = parseInt(literal.value.substring(14, 16), 10);
  const utcSeconds = parseInt(literal.value.substring(17, literal.value.indexOf('Z')), 10);
  const date = new Date(0);
  date.setUTCFullYear(utcFullYear);
  date.setUTCMonth(utcMonth);
  date.setUTCDate(utcDate);
  date.setUTCHours(utcHours);
  date.setUTCMinutes(utcMinutes);
  date.setUTCSeconds(utcSeconds);
  return date;
}
function fromIntegerLiteral(literal: IntegerLiteral): number {
  return parseInt(literal.value, 10);
}
function fromDecimalLiteral(literal: DecimalLiteral): number {
  return parseFloat(literal.value);
}
function fromStringLiteral(literal: StringLiteral | LocaleStringLiteral<string>): string {
  return literal.value;
}
function fromLiteral(literal: Literal): LiteralTypes {
  if (isDateTimeLiteral(literal)) {
    return fromDateTimeLiteral(literal);
  }
  if (isIntegerLiteral(literal)) {
    return fromIntegerLiteral(literal);
  }
  if (isDecimalLiteral(literal)) {
    return fromDecimalLiteral(literal);
  }
  return literal.value;
}
function asLiteral(literal: LiteralTypes): Literal {
  if (literal instanceof Date) {
    // To align with rdflib, we ignore miliseconds:
    // https://github.com/linkeddata/rdflib.js/blob/d84af88f367b8b5f617c753d8241c5a2035458e8/src/literal.js#L74
    const roundedDate = new Date(
      Date.UTC(
        literal.getUTCFullYear(), literal.getUTCMonth(), literal.getUTCDate(),
        literal.getUTCHours(), literal.getUTCMinutes(), literal.getUTCSeconds(), 0,
      ),
    );
    // Truncate the `.000Z` at the end (i.e. the miliseconds), to plain `Z`:
    const rdflibStyleString = roundedDate.toISOString().replace(/\.000Z$/, 'Z');
    return DataFactory.literal(rdflibStyleString, DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'));
  }
  if (typeof literal === 'number' && Number.isInteger(literal)) {
    return DataFactory.literal(literal.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer'))
  }
  if (typeof literal === 'number' && !Number.isInteger(literal)) {
    return DataFactory.literal(literal.toString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#decimal'))
  }
  return DataFactory.literal(literal.toString());
}
