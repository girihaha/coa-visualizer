import { describe, it, expect } from 'vitest';
import { buildIeee754 } from '@/sims/logic/ieee754';

const enc = (t: string) => {
  const r = buildIeee754(t);
  expect(r.error).toBeUndefined();
  return r.steps[r.steps.length - 1].state;
};

const hwBits = (x: number) => {
  const dv = new DataView(new ArrayBuffer(4));
  dv.setFloat32(0, x);
  return dv.getUint32(0).toString(2).padStart(32, '0');
};

describe('buildIeee754', () => {
  it('85.125 -> sign 0, exponent 133 (10000101), fraction 01010100100000000000000', () => {
    const s = enc('85.125');
    expect(s.sign).toBe('0');
    expect(s.binary).toBe('1010101.001');
    expect(s.unbiased).toBe(6);
    expect(s.exponent).toBe('10000101');
    expect(parseInt(s.exponent, 2)).toBe(133);
    expect(s.fraction).toBe('01010100100000000000000');
    expect(s.bits).toBe('0' + '10000101' + '01010100100000000000000');
    expect(s.note).toBe('Verified');
  });

  it('-0.75 -> sign 1, exponent 126', () => {
    const s = enc('-0.75');
    expect(s.sign).toBe('1');
    expect(parseInt(s.exponent, 2)).toBe(126);
    expect(s.fraction).toBe('1' + '0'.repeat(22));
    expect(s.bits).toBe(hwBits(-0.75));
  });

  it('46.6875 and other exact values match hardware encoding', () => {
    for (const t of ['46.6875', '1', '-1', '0.5', '0.375', '-0.375', '2', '1024', '0.0625', '12345.5']) {
      const s = enc(t);
      expect(s.bits).toBe(hwBits(Number(t)));
      expect(s.note).toBe('Verified');
    }
    expect(enc('46.6875').binary).toBe('101110.1011');
  });

  it('zero and negative zero', () => {
    expect(enc('0').bits).toBe('0'.repeat(32));
    expect(enc('0.000').bits).toBe('0'.repeat(32));
    const nz = enc('-0');
    expect(nz.sign).toBe('1');
    expect(nz.bits).toBe(hwBits(-0));
  });

  it('rejects invalid or inexact input', () => {
    for (const t of ['abc', '1e5', '', '0.1', '16777217', '1.' ]) {
      const r = buildIeee754(t);
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
