import { Literal } from 'rdf-js';
import { rdf } from 'rdf-namespaces';
import { DataFactory } from './n3dataset';
import {
  initialiseSubject, TripleSubject
} from './subject';
import { fetchDocument } from './document';
import { triplesToTurtle } from './turtle';

const { triple, namedNode, literal, blankNode } = DataFactory;

const mockDocument = 'https://document.com/';
const mockSubjectWithLiteralThenRef = 'https://subject1.com/';
const mockSubjectWithRefThenLiteral = 'https://subject2.com/';
const mockSubjectWithBlankNodeThenRef = 'https://document.com/#blank-node-then-ref';
const mockSubjectWithRefThenBlankNode = 'https://document.com/#ref-then-blank-node';
const mockSubjectWithLiteral = 'https://subject3.com/';
const mockSubjectWithRef = 'https://subject4.com/';
const mockSubjectWithTwoLiterals = 'https://subject5.com/';
const mockSubjectWithTwoRefs = 'https://subject6.com/';
const mockSubjectWithDateLiteral = 'https://subject7.com/';
const mockSubjectWithIntegerLiteral = 'https://subject8.com/';
const mockSubjectWithDecimalLiteral = 'https://subject9.com/';
const mockSubjectWithDifferentTypesOfLiterals = 'https://subject10.com/';
const mockSubjectWithDifferentPredicates = 'https://subject11.com/';
const mockSubjectWithLocaleStringLiteral = 'https://subject12.com/';
const mockSubjectWithLocaleAndRegularStringLiteral = 'https://subject13.com/';
const mockSubjectWithMultipleLocaleStringLiterals = 'https://subject14.com/';
const mockSubjectWithLangStringLiteral = 'https://subject15.com/';
const mockSubjectWithMultipleSameLocaleStringLiterals = 'https://subject16.com/';
const mockTypedSubject = 'https://subject7.com/';
const mockEmptySubject = 'https://empty-subject.com/';
const mockPredicate = 'https://mock-predicate.com/';
const mockPredicate2 = 'https://mock-predicate-2.com/';
const mockObjectRef = 'https://mock-object.com/';
const mockObjectRef2 = 'https://mock-object-2.com/';
const mockLiteralValue = 'Arbitrary literal value';
const mockObjectLiteral = literal(mockLiteralValue);
const mockLiteralValue2 = 'Another arbitrary literal value';
const mockObjectLiteral2 = literal(mockLiteralValue2);
const mockLiteralDateTime = new Date(0);
// '1970-01-01T01:00:00Z' is the string representation rdflib uses of Date(0):
const mockLiteralDateTimeString = '1970-01-01T00:00:00Z';
const mockObjectDateTimeLiteral = literal(mockLiteralDateTimeString, namedNode('http://www.w3.org/2001/XMLSchema#dateTime'));
const mockLiteralInteger = 1337;
const mockObjectIntegerLiteral = literal(mockLiteralInteger.toString(), namedNode('http://www.w3.org/2001/XMLSchema#integer'));
const mockLiteralDecimal = 4.2;
const mockObjectDecimalLiteral = literal(mockLiteralDecimal.toString(), namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
const mockLiteralLocaleString = 'Dutch (NL)';
const mockLocale = 'nl-NL';
const mockObjectLocaleStringLiteral = literal(mockLiteralLocaleString, mockLocale);
const mockLiteralLocaleString2 = 'Dutch (NL) 2';
const mockObjectLocaleStringLiteral2 = literal(mockLiteralLocaleString2, mockLocale);
const mockLiteralLangString = 'Dutch (no country specified)';
const mockLang = 'nl';
const mockObjectLangStringLiteral = literal(mockLiteralLangString, mockLang);
const mockTypeObject = 'https://mock-type-object.com/';
const mockBlankNode = 'arbitrary-blank-node-id';
const mockTriples = [
  triple(namedNode(mockSubjectWithLiteralThenRef), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithLiteralThenRef), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithRefThenLiteral), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithRefThenLiteral), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithBlankNodeThenRef), namedNode(mockPredicate), blankNode(mockBlankNode)),
  triple(namedNode(mockSubjectWithBlankNodeThenRef), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithRefThenBlankNode), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithRefThenBlankNode), namedNode(mockPredicate), blankNode(mockBlankNode)),
  triple(blankNode(mockBlankNode), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithLiteral), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithRef), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithTwoLiterals), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithTwoLiterals), namedNode(mockPredicate), mockObjectLiteral2),
  triple(namedNode(mockSubjectWithTwoLiterals), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithTwoRefs), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithTwoRefs), namedNode(mockPredicate), namedNode(mockObjectRef2)),
  triple(namedNode(mockSubjectWithTwoRefs), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockTypedSubject), namedNode(rdf.type), namedNode(mockTypeObject)),
  triple(namedNode(mockSubjectWithDateLiteral), namedNode(mockPredicate), mockObjectDateTimeLiteral),
  triple(namedNode(mockSubjectWithDecimalLiteral), namedNode(mockPredicate), mockObjectDecimalLiteral),
  triple(namedNode(mockSubjectWithIntegerLiteral), namedNode(mockPredicate), mockObjectIntegerLiteral),
  triple(namedNode(mockSubjectWithDifferentTypesOfLiterals), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithDifferentTypesOfLiterals), namedNode(mockPredicate), mockObjectLiteral2),
  triple(namedNode(mockSubjectWithDifferentTypesOfLiterals), namedNode(mockPredicate), mockObjectDateTimeLiteral),
  triple(namedNode(mockSubjectWithDifferentTypesOfLiterals), namedNode(mockPredicate), mockObjectDecimalLiteral),
  triple(namedNode(mockSubjectWithDifferentTypesOfLiterals), namedNode(mockPredicate), mockObjectIntegerLiteral),
  triple(namedNode(mockSubjectWithDifferentPredicates), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithDifferentPredicates), namedNode(mockPredicate), namedNode(mockObjectRef)),
  triple(namedNode(mockSubjectWithDifferentPredicates), namedNode(mockPredicate2), namedNode(mockObjectRef2)),
  triple(namedNode(mockSubjectWithLocaleStringLiteral), namedNode(mockPredicate), mockObjectLocaleStringLiteral),
  triple(namedNode(mockSubjectWithLocaleAndRegularStringLiteral), namedNode(mockPredicate), mockObjectLiteral),
  triple(namedNode(mockSubjectWithLocaleAndRegularStringLiteral), namedNode(mockPredicate), mockObjectLocaleStringLiteral),
  triple(namedNode(mockSubjectWithMultipleLocaleStringLiterals), namedNode(mockPredicate), mockObjectLangStringLiteral),
  triple(namedNode(mockSubjectWithMultipleLocaleStringLiterals), namedNode(mockPredicate), mockObjectLocaleStringLiteral),
  triple(namedNode(mockSubjectWithMultipleSameLocaleStringLiterals), namedNode(mockPredicate), mockObjectLocaleStringLiteral),
  triple(namedNode(mockSubjectWithMultipleSameLocaleStringLiterals), namedNode(mockPredicate), mockObjectLocaleStringLiteral2),
];
const turtle = triplesToTurtle(mockTriples);
jest.mock('./pod', () => ({
  get: jest.fn(() => Promise.resolve({
    headers: { get: () => null },
    text: jest.fn(() => Promise.resolve(turtle)),
  })),
}));

async function getMockTripleDocument() {
  const mockTripleDocument = await fetchDocument(mockDocument);
  return mockTripleDocument;
}

describe('asRef', () => {
  it('should give access to the IRI that represents this Subject', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.asRef())
      .toBe(mockSubjectWithLiteral);
  });

  it('should give access to the local ID for a Subject if it is a local Subject (i.e. a Blank Node)', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, blankNode(mockBlankNode));
    expect(subject.asRef())
      // N3 generates an ID based on the ID we pass.
      // This is OK, as it shouldn't be used as an identifier anywhere anyway,
      // because the Subject is local to this Document and can not be passed around.
      .toMatch(mockBlankNode);
  });
});

describe('getDocument', () => {
  it('should give access to the Document that contains this Subject', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.getDocument())
      .toEqual(mockTripleDocument);
  });
});

describe('getTriples', () => {
  it('should give access to only the Triples that are relevant to this Subject', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.getTriples())
      .toEqual([triple(namedNode(mockSubjectWithLiteral), namedNode(mockPredicate), mockObjectLiteral)]);
  });
});

describe('getLiteral', () => {
  it('should return a found Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.getLiteral(mockPredicate))
      .toBe(mockLiteralValue);
  });

  it('should return a found Integer Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    expect(typeof subject.getLiteral(mockPredicate)).toBe('number');
    expect((subject.getLiteral(mockPredicate))).toBe(mockLiteralInteger);
  });

  it('should return a found Decimal Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    expect(typeof subject.getLiteral(mockPredicate)).toBe('number');
    expect((subject.getLiteral(mockPredicate))).toBe(mockLiteralDecimal);
  });

  it('should return a found Date Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(subject.getLiteral(mockPredicate)).toBeInstanceOf(Date);
    expect((subject.getLiteral(mockPredicate) as Date).getTime())
      .toEqual(0);
  });

  it('should return null if a Reference is found instead of a Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getLiteral(mockPredicate))
      .toBeNull();
  });

  it('should return null if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getLiteral(mockPredicate))
      .toBeNull();
  });

  it('should return the first found value if that is a Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    expect(subject.getLiteral(mockPredicate))
      .toBe(mockLiteralValue);
  });

  it('should return the second found value if that is the first Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRefThenLiteral);
    expect(subject.getLiteral(mockPredicate))
      .toBe(mockLiteralValue);
  });

  it('should only return a single Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoLiterals);
    expect(subject.getLiteral(mockPredicate))
      .toBe(mockLiteralValue);
  });
});

describe('getString', () => {
  it('should return a found string Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getString(mockPredicate))
      .toBe(mockLiteralValue);
  });

  it('should return null if a Reference is found instead of a string Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getString(mockPredicate))
      .toBeNull();
  });

  it('should return null if a non-string Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(subject.getString(mockPredicate))
      .toBeNull();
  });

  it('should return null if a locale string Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLocaleStringLiteral);
    expect(subject.getString(mockPredicate))
      .toBeNull();
  });
});

describe('getLocaleString', () => {
  it('should return a found locale string Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLocaleStringLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBe(mockLiteralLocaleString);
  });

  it('should return the desired locale string Literal when multiple are present', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithMultipleLocaleStringLiterals);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBe(mockLiteralLocaleString);
  });

  it('should return the desired locale string Literal when regular strings are present as well', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLocaleAndRegularStringLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBe(mockLiteralLocaleString);
  });

  it('should return null if the language matches but the full locale does not - picking the right one is left to the developer', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLocaleStringLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLang))
      .toBeNull();
  });

  it('should return null if the language matches but there is no info about the locale - it is up to developer to decide whether to look for those as well', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLangStringLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBeNull();
  });

  it('should return null if a non-locale-string Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBeNull();
  });

  it('should return null if a non-locale string Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.getLocaleString(mockPredicate, mockLocale))
      .toBeNull();
  });
});

describe('getInteger', () => {
  it('should return a found integer Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getInteger(mockPredicate))
      .toBe(mockLiteralInteger);
  });


  it('should return null if a Reference is found instead of a integer Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getInteger(mockPredicate))
      .toBeNull();
  });

  it('should return null if a non-integer Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(subject.getString(mockPredicate))
      .toBeNull();
  });
});

describe('getDecimal', () => {
  it('should return a found decimal Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getDecimal(mockPredicate))
      .toBe(mockLiteralDecimal);
  });


  it('should return null if a Reference is found instead of a decimal Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getDecimal(mockPredicate))
      .toBeNull();
  });

  it('should return null if a non-decimal Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(subject.getDecimal(mockPredicate))
      .toBeNull();
  });
});

describe('getDate', () => {
  it('should return a found Date Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getDateTime(mockPredicate))
      .toEqual(new Date(0));
  });


  it('should return null if a Reference is found instead of a Date Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getDateTime(mockPredicate))
      .toBeNull();
  });

  it('should return null if a non-Date Literal is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    expect(subject.getDateTime(mockPredicate))
      .toBeNull();
  });
});

describe('getAllStrings', () => {
  it('should only return string Literals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getAllStrings(mockPredicate))
      .toEqual([mockLiteralValue, mockLiteralValue2]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllStrings(mockPredicate))
      .toEqual([]);
  });
});

describe('getAllLocaleStrings', () => {
  it('should only return locale string Literals that match the given locale', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithMultipleSameLocaleStringLiterals);
    expect(subject.getAllLocaleStrings(mockPredicate, mockLocale))
      .toEqual([mockLiteralLocaleString, mockLiteralLocaleString2]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllLocaleStrings(mockPredicate, mockLocale))
      .toEqual([]);
  });
});

describe('getAllIntegers', () => {
  it('should only return integer Literals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getAllIntegers(mockPredicate))
      .toEqual([mockLiteralInteger]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllIntegers(mockPredicate))
      .toEqual([]);
  });
});

describe('getAllDecimals', () => {
  it('should only return decimal Literals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getAllDecimals(mockPredicate))
      .toEqual([mockLiteralDecimal]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllDecimals(mockPredicate))
      .toEqual([]);
  });
});

describe('getAllDateTimes', () => {
  it('should only return DateTime Literals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentTypesOfLiterals);
    expect(subject.getAllDateTimes(mockPredicate))
      .toEqual([mockLiteralDateTime]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllDateTimes(mockPredicate))
      .toEqual([]);
  });
});

describe('getAllLiterals', () => {
  it('should only return Literals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoLiterals);
    expect(subject.getAllLiterals(mockPredicate))
      .toEqual([mockLiteralValue, mockLiteralValue2]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllLiterals(mockPredicate))
      .toEqual([]);
  });
});

describe('getLocalSubject', () => {
  it('should return a new TripleSubject representing a local Subject', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithBlankNodeThenRef);
    const localSubject = subject.getLocalSubject(mockPredicate);
    expect(localSubject).not.toBeNull();
    expect((localSubject as TripleSubject).getRef(mockPredicate))
      .toEqual(mockObjectRef);
  });

  it('should return null if a Reference is found instead of a local Subject', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getLocalSubject(mockPredicate))
      .toBeNull();
  });

  it('should return a new TripleSubject representing a local Subject, even if a Reference also matches the predicate', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRefThenBlankNode);
    const localSubject = subject.getLocalSubject(mockPredicate);
    expect(localSubject).not.toBeNull();
    expect((localSubject as TripleSubject).getRef(mockPredicate))
      .toEqual(mockObjectRef);
  });

});

describe('getAllLocalSubjects', () => {
  it('should only return local Subjects (i.e. those with a Blank Node)', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRefThenBlankNode);

    const localSubjects = subject.getAllLocalSubjects(mockPredicate);

    expect(localSubjects.length)
      .toBe(1);
    expect(localSubjects[0].getRef(mockPredicate))
      .toEqual(mockObjectRef);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllLocalSubjects(mockPredicate))
      .toEqual([]);
  });
});

describe('getRef', () => {
  it('should return a found Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    expect(subject.getRef(mockPredicate))
      .toEqual(mockObjectRef);
  });

  it('should return null if a Reference is found instead of a Literal', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(subject.getRef(mockPredicate))
      .toBeNull();
  });

  it('should return null if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getRef(mockPredicate))
      .toBeNull();
  });

  it('should return the first found value if that is a Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRefThenLiteral);
    expect(subject.getRef(mockPredicate))
      .toBe(mockObjectRef);
  });

  it('should return the second found value if that is the first Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    expect(subject.getRef(mockPredicate))
      .toBe(mockObjectRef);
  });

  it('should only return a single Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoRefs);
    expect(subject.getRef(mockPredicate))
      .toBe(mockObjectRef);
  });
});

describe('getType', () => {
  it('should return a Subject\'s type', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockTypedSubject);
    expect(subject.getType()).toEqual(mockTypeObject);
  });

  it('should return null if no type was defined', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getType()).toBeNull();
  });
});

describe('getAllRefs', () => {
  it('should only return References', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoRefs);
    expect(subject.getAllRefs(mockPredicate))
      .toEqual([mockObjectRef, mockObjectRef2]);
  });

  it('should return an empty array if nothing is found', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockEmptySubject);
    expect(subject.getAllRefs(mockPredicate))
      .toEqual([]);
  });
});

describe('addLiteral', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addLiteral(mockPredicate, 'Some literal value');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect(pendingAdditions[0].object.value).toBe('Some literal value');
  });

  it('should properly represent an integer, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    const someInteger = 1337;
    subject.addLiteral(mockPredicate, someInteger);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(pendingAdditions[0].object.value).toBe('1337');
  });

  it('should properly represent a decimal, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    const someDecimal = 4.2;
    subject.addLiteral(mockPredicate, someDecimal);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingAdditions[0].object.value).toBe('4.2');
  });

  it('should properly represent a Date, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    const someDate = new Date(71697398400000);
    subject.addLiteral(mockPredicate, someDate);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    expect(pendingAdditions[0].object.value).toBe('4242-01-01T00:00:00Z');
  });
});

describe('addString', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addString(mockPredicate, 'Some string value');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#string');
    expect(pendingAdditions[0].object.value).toBe('Some string value');
  });

  it('should throw an error when something other than a string was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addString(mockPredicate, 1337 as any))
      .toThrowError('The given value is not a string.');
  });
});

describe('addLocaleString', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addLocaleString(mockPredicate, 'Some localised string value', 'en-GB');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    expect((pendingAdditions[0].object as Literal).language)
      .toBe('en-gb');
    expect(pendingAdditions[0].object.value).toBe('Some localised string value');
  });

  it('should throw an error when something other than a string was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addLocaleString(mockPredicate, 1337 as any, 'nl-NL'))
      .toThrowError('The given value is not a string.');
  });
});

describe('addInteger', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addInteger(mockPredicate, 42);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(pendingAdditions[0].object.value).toBe('42');
  });

  it('should throw an error when something other than a number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addInteger(mockPredicate, new Date() as any))
      .toThrowError('The given value is not an integer.');
  });

  it('should throw an error when a decimal number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addInteger(mockPredicate, 13.37))
      .toThrowError('The given value is not an integer.');
  });
});

describe('addDecimal', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addDecimal(mockPredicate, 13.37);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingAdditions[0].object.value).toBe('13.37');
  });

  it('should store an integer as a decimal number', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addDecimal(mockPredicate, 42);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect(pendingAdditions[0].object.value).toBe('42');
  });

  it('should throw an error when something other than a number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addDecimal(mockPredicate, 'Not a number' as any))
      .toThrowError('The given value is not a decimal.');
  });
});

describe('addDateTime', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    subject.addDateTime(mockPredicate, new Date(Date.UTC(1970, 0)));
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    expect(pendingAdditions[0].object.value).toBe('1970-01-01T00:00:00Z');
  });

  it('should throw an error when something other than a Date was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteral);
    expect(() => subject.addDateTime(mockPredicate, 'Not a Date' as any))
      .toThrowError('The given value is not a DateTime.');
  });
});

describe('removeLiteral', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoLiterals);
    subject.removeLiteral(mockPredicate, mockLiteralValue2);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect(pendingDeletions[0].object.value).toBe(mockLiteralValue2);
  });

  it('should properly remove an integer, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    subject.removeLiteral(mockPredicate, mockLiteralInteger);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(pendingDeletions[0].object.value).toBe(mockLiteralInteger.toString());
  });

  it('should properly remove a decimal, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    subject.removeLiteral(mockPredicate, mockLiteralDecimal);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingDeletions[0].object.value).toBe(mockLiteralDecimal.toString());
  });

  it('should properly remove a Date, if given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    subject.removeLiteral(mockPredicate, mockLiteralDateTime);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    expect(pendingDeletions[0].object.value).toBe(mockLiteralDateTimeString);
  });
});

describe('removeString', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoLiterals);
    subject.removeString(mockPredicate, 'Some string');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#string');
    expect(pendingDeletions[0].object.value).toBe('Some string');
  });

  it('should throw an error if something other than a string was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    expect(() => subject.removeString(mockPredicate, new Date() as any))
      .toThrowError('The given value is not a string.');
  });
});

describe('removeLocaleString', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithTwoLiterals);
    subject.removeLocaleString(mockPredicate, 'Some string', 'en-GB');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    expect((pendingDeletions[0].object as Literal).language).toBe('en-gb');
    expect(pendingDeletions[0].object.value).toBe('Some string');
  });

  it('should throw an error if something other than a string was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    expect(() => subject.removeLocaleString(mockPredicate, 42 as any, 'nl-NL'))
      .toThrowError('The given value is not a string.');
  });
});

describe('removeInteger', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    subject.removeInteger(mockPredicate, 42);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(pendingDeletions[0].object.value).toBe('42');
  });

  it('should throw an error if something other than a number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    expect(() => subject.removeInteger(mockPredicate, 'Not a number' as any))
      .toThrowError('The given value is not an integer.');
  });

  it('should throw an error if a non-integer number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithIntegerLiteral);
    expect(() => subject.removeInteger(mockPredicate, 13.37))
      .toThrowError('The given value is not an integer.');
  });
});

describe('removeDecimal', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    subject.removeDecimal(mockPredicate, 13.37);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingDeletions[0].object.value).toBe('13.37');
  });

  it('should store integers as decimals', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    subject.removeDecimal(mockPredicate, 42);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingDeletions[0].object.value).toBe('42');
  });

  it('should throw an error if something other than a number was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDecimalLiteral);
    expect(() => subject.removeDecimal(mockPredicate, 'Not a number' as any))
      .toThrowError('The given value is not a decimal.');
  });
});

describe('removeDateTime', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    subject.removeDateTime(mockPredicate, new Date(Date.UTC(1970, 0)));
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions.length).toBe(1);
    expect(pendingDeletions[0].object.termType).toBe('Literal');
    expect((pendingDeletions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    expect(pendingDeletions[0].object.value).toBe('1970-01-01T00:00:00Z');
  });

  it('should throw an error if something other than a DateTime was given', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDateLiteral);
    expect(() => subject.removeDateTime(mockPredicate, 42 as any))
      .toThrowError('The given value is not a DateTime.');
  });
});

describe('setLiteral', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setLiteral(mockPredicate, mockLiteralValue2);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect(pendingAdditions[0].object.value).toBe(mockLiteralValue2);
  });
});

describe('setString', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setString(mockPredicate, 'Some string');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#string');
    expect(pendingAdditions[0].object.value).toBe('Some string');
  });
});

describe('setLocaleString', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setLocaleString(mockPredicate, 'Some string', 'en-GB');
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
    expect((pendingAdditions[0].object as Literal).language).toBe('en-gb');
    expect(pendingAdditions[0].object.value).toBe('Some string');
  });
});

describe('setInteger', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setInteger(mockPredicate, 42);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#integer');
    expect(pendingAdditions[0].object.value).toBe('42');
  });
});

describe('setDecimal', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setDecimal(mockPredicate, 13.37);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#decimal');
    expect(pendingAdditions[0].object.value).toBe('13.37');
  });
});

describe('setDateTime', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setDateTime(mockPredicate, new Date(Date.UTC(1970, 0)));
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions.length).toBe(1);
    expect(pendingAdditions[0].object.termType).toBe('Literal');
    expect((pendingAdditions[0].object as Literal).datatype.value)
      .toBe('http://www.w3.org/2001/XMLSchema#dateTime');
    expect(pendingAdditions[0].object.value).toBe('1970-01-01T00:00:00Z');
  });
});

describe('addRef', () => {
  it('should produce Triples that the Document can store in the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    subject.addRef(mockPredicate, mockObjectRef2);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([]);
    expect(pendingAdditions)
      .toEqual([triple(
        namedNode(mockSubjectWithRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef2),
      )]);
  });
});

describe('removeRef', () => {
  it('should produce Triples that the Document can apply to the user\'s Pod', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithRef);
    subject.removeRef(mockPredicate, mockObjectRef);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions)
      .toEqual([triple(
        namedNode(mockSubjectWithRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      )]);
  });
});

describe('setRef', () => {
  it('should remove all existing values, whether Literal or Ref', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.setRef(mockPredicate, mockObjectRef2);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
    expect(pendingAdditions)
      .toEqual([triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef2),
      )]);
  });
});

describe('removeAll', () => {
  it('should remove all existing values, whether Literal or Reference', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithLiteralThenRef);
    subject.removeAll(mockPredicate);
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithLiteralThenRef),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
    ]);
  });
});

describe('clear', () => {
  it('should remove all existing values, whether Literal or Reference, regardless of the predicate', async () => {
    const mockTripleDocument = await getMockTripleDocument();
    const subject = initialiseSubject(mockTripleDocument, mockSubjectWithDifferentPredicates);
    subject.clear();
    const [pendingDeletions, pendingAdditions] = subject.getPendingTriples();
    expect(pendingAdditions).toEqual([]);
    expect(pendingDeletions).toEqual([
      triple(
        namedNode(mockSubjectWithDifferentPredicates),
        namedNode(mockPredicate),
        mockObjectLiteral,
      ),
      triple(
        namedNode(mockSubjectWithDifferentPredicates),
        namedNode(mockPredicate),
        namedNode(mockObjectRef),
      ),
      triple(
        namedNode(mockSubjectWithDifferentPredicates),
        namedNode(mockPredicate2),
        namedNode(mockObjectRef2),
      ),
    ]);
  });
});
