import { describe, it, expect } from 'vitest';
import {
  toBits,
  fromBitsUnsigned,
  fromBitsSigned,
  signedRange,
  parseSignedInt,
  parseBinary,
  groupBits,
} from '@/sims/logic/bits';

describe('bits', () => {
  it('toBits pads and wraps negatives as two\'s complement', () => {
    expect(toBits(5, 4)).toBe('0101');
    expect(toBits(-3, 4)).toBe('1101');
    expect(toBits(-21, 8)).toBe('11101011');
    expect(toBits(16, 4)).toBe('0000');
    expect(toBits(255n, 8)).toBe('11111111');
  });

  it('fromBitsUnsigned / fromBitsSigned', () => {
    expect(fromBitsUnsigned('1011')).toBe(11n);
    expect(fromBitsUnsigned('')).toBe(0n);
    expect(fromBitsSigned('1011')).toBe(-5n);
    expect(fromBitsSigned('0111')).toBe(7n);
    expect(fromBitsSigned('1000')).toBe(-8n);
    expect(fromBitsSigned('11101011')).toBe(-21n);
  });

  it('round-trips every 4-bit signed value', () => {
    for (let v = -8; v <= 7; v++) expect(fromBitsSigned(toBits(v, 4))).toBe(BigInt(v));
  });

  it('signedRange', () => {
    expect(signedRange(4)).toEqual([-8n, 7n]);
    expect(signedRange(8)).toEqual([-128n, 127n]);
  });

  it('parseSignedInt', () => {
    expect(parseSignedInt(' -42 ')).toBe(-42n);
    expect(parseSignedInt('+7')).toBe(7n);
    expect(parseSignedInt('1.5')).toBeNull();
    expect(parseSignedInt('abc')).toBeNull();
    expect(parseSignedInt('')).toBeNull();
  });

  it('parseBinary strips whitespace and rejects non-binary', () => {
    expect(parseBinary('0011 1001')).toBe('00111001');
    expect(parseBinary('1021')).toBeNull();
    expect(parseBinary('')).toBeNull();
  });

  it('groupBits', () => {
    expect(groupBits('001110010101')).toBe('0011 1001 0101');
    expect(groupBits('11101011', 4)).toBe('1110 1011');
    expect(groupBits('101101', 3)).toBe('101 101');
    expect(groupBits('1011')).toBe('1011');
  });
});
