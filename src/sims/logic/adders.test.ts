import { describe, it, expect } from 'vitest';
import { rippleColumns, claCarries, HALF_ADDER_ROWS, FULL_ADDER_ROWS } from '@/sims/logic/adders';
import { toBits } from '@/sims/logic/bits';

describe('adders', () => {
  it('ripple 1011 + 0110 = 1 0001', () => {
    const r = rippleColumns('1011', '0110', 0);
    expect(r.sum).toBe('0001');
    expect(r.carryOut).toBe(1);
    expect(r.columns.map((c) => c.cout)).toEqual([0, 1, 1, 1]);
    expect(r.columns[0]).toMatchObject({ index: 0, a: 1, b: 0, cin: 0, sum: 1, cout: 0, g: 0, p: 1 });
  });

  it('ripple with carry-in', () => {
    const r = rippleColumns('1111', '0000', 1);
    expect(r.sum).toBe('0000');
    expect(r.carryOut).toBe(1);
  });

  it('ripple is correct for all 4-bit pairs and both carry-ins', () => {
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++)
        for (const c of [0, 1]) {
          const r = rippleColumns(toBits(a, 4), toBits(b, 4), c);
          expect(r.carryOut * 16 + parseInt(r.sum, 2)).toBe(a + b + c);
        }
  });

  it('CLA carries equal ripple carries for every 4-bit pair (exhaustive)', () => {
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++)
        for (const c0 of [0, 1]) {
          const r = rippleColumns(toBits(a, 4), toBits(b, 4), c0);
          const p = r.columns.map((c) => c.p);
          const g = r.columns.map((c) => c.g);
          const rippleCarries = [c0, ...r.columns.map((c) => c.cout)];
          expect(claCarries(p, g, c0)).toEqual(rippleCarries);
        }
  });

  it('half adder truth table', () => {
    expect(HALF_ADDER_ROWS).toEqual([
      { a: 0, b: 0, sum: 0, carry: 0 },
      { a: 0, b: 1, sum: 1, carry: 0 },
      { a: 1, b: 0, sum: 1, carry: 0 },
      { a: 1, b: 1, sum: 0, carry: 1 },
    ]);
  });

  it('full adder truth table', () => {
    expect(FULL_ADDER_ROWS).toHaveLength(8);
    for (const r of FULL_ADDER_ROWS) {
      expect(r.carry * 2 + r.sum).toBe(r.a + r.b + r.c);
    }
  });
});
