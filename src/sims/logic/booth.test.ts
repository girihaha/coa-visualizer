import { describe, it, expect } from 'vitest';
import { buildBooth, arithmeticRightShift } from '@/sims/logic/booth';
import { fromBitsSigned } from '@/sims/logic/bits';

describe('arithmeticRightShift', () => {
  it('copies sign and moves A LSB into Q, Q LSB into Q-1', () => {
    expect(arithmeticRightShift('10110', '0101')).toEqual({ A: '11011', Q: '0010', Qm1: '1' });
    expect(arithmeticRightShift('00011', '1000')).toEqual({ A: '00001', Q: '1100', Qm1: '0' });
  });
});

describe('buildBooth', () => {
  it('7 x -3 = -21 in 4 bits -> 11101011', () => {
    const r = buildBooth({ m: '7', q: '-3', n: 4 });
    expect(r.error).toBeUndefined();
    const s = r.steps[r.steps.length - 1].state;
    expect(s.M).toBe('00111');
    expect(s.product).toBe('11101011');
    expect(fromBitsSigned(s.product!)).toBe(-21n);
  });

  it('exhaustive 4-bit signed products', () => {
    for (let m = -8; m <= 7; m++)
      for (let q = -8; q <= 7; q++) {
        const s = buildBooth({ m: String(m), q: String(q), n: 4 }).steps.at(-1)!.state;
        expect(s.product).toHaveLength(8);
        expect(fromBitsSigned(s.product!)).toBe(BigInt(m * q));
      }
  });

  it('8-bit: -128 x -128 = 16384, -128 x 127 = -16256', () => {
    expect(fromBitsSigned(buildBooth({ m: '-128', q: '-128', n: 8 }).steps.at(-1)!.state.product!)).toBe(16384n);
    expect(fromBitsSigned(buildBooth({ m: '-128', q: '127', n: 8 }).steps.at(-1)!.state.product!)).toBe(-16256n);
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildBooth({ m: '8', q: '1', n: 4 }),
      buildBooth({ m: '1', q: '-9', n: 4 }),
      buildBooth({ m: '1.5', q: '1', n: 4 }),
      buildBooth({ m: '1', q: '1', n: 1 }),
      buildBooth({ m: '1', q: '1', n: 9 }),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
