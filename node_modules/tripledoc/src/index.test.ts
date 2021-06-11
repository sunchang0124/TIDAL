import { DataFactory } from './n3dataset';
import { isLiteral, isReference } from './index';

const { literal } = DataFactory;

describe('isLiteral', () => {
  it('should return true if a value is an N3 `Literal`', () => {
    expect(isLiteral(literal('Some value')))
      .toBe(true);
  });

  it('should return false for an arbitrary other object', () => {
    expect(isLiteral({ arbitrary: 'object' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLiteral(null)).toBe(false);
  });

  it('should return false for atomic Javascript values', () => {
    expect(isLiteral('arbitrary string')).toBe(false);
    expect(isLiteral(4.2)).toBe(false);
    expect(isLiteral(true)).toBe(false);
    expect(isLiteral(undefined)).toBe(false);
  });
});

describe('isReference', () => {
  it('should return true if a value is a string', () => {
    expect(isReference('http://some-node.com')).toBe(true);
  });

  it('should return false if a value is an N3 Literal', () => {
    expect(isReference(literal('Some value')))
      .toBe(false);
  });

  it('should return false if a value is not a string and hence cannot be a URL', () => {
    expect(isReference({ arbitrary: 'object' } as any)).toBe(false);
    expect(isReference(13.37 as any)).toBe(false);
    expect(isReference(null as any)).toBe(false);
    expect(isReference(true as any)).toBe(false);
  });
});
