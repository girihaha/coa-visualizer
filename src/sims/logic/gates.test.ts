import { describe, it, expect } from 'vitest';
import { GATES, evalGate, truthTable, halfAdder, fullAdder, deMorgan } from '@/sims/logic/gates';

const BITS = [0, 1] as const;

describe('logic gates', () => {
  it('matches the standard truth tables', () => {
    expect(truthTable('AND').map((r) => r.y)).toEqual([0, 0, 0, 1]);
    expect(truthTable('OR').map((r) => r.y)).toEqual([0, 1, 1, 1]);
    expect(truthTable('NAND').map((r) => r.y)).toEqual([1, 1, 1, 0]);
    expect(truthTable('NOR').map((r) => r.y)).toEqual([1, 0, 0, 0]);
    expect(truthTable('XOR').map((r) => r.y)).toEqual([0, 1, 1, 0]);
    expect(truthTable('XNOR').map((r) => r.y)).toEqual([1, 0, 0, 1]);
  });

  it('NOT inverts its single input', () => {
    expect(evalGate('NOT', 0, 0)).toBe(1);
    expect(evalGate('NOT', 1, 0)).toBe(0);
  });

  it('defines all seven gates', () => {
    expect(GATES.map((g) => g.name).sort()).toEqual(['AND', 'NAND', 'NOR', 'NOT', 'OR', 'XNOR', 'XOR']);
  });
});

describe('adders', () => {
  it('half adder: S = A xor B, C = A and B', () => {
    for (const a of BITS) for (const b of BITS) expect(halfAdder(a, b)).toMatchObject({ sum: a ^ b, carry: a & b });
  });

  it('full adder sum and carry equal the arithmetic sum of three bits', () => {
    for (const a of BITS)
      for (const b of BITS)
        for (const c of BITS) {
          const r = fullAdder(a, b, c);
          expect(r.sum + 2 * r.carry).toBe(a + b + c);
        }
  });
});

describe('De Morgan', () => {
  it('both laws hold for every input row', () => {
    for (const a of BITS)
      for (const b of BITS) {
        const r = deMorgan(a, b);
        expect(r.law1Left).toBe(r.law1Right);
        expect(r.law2Left).toBe(r.law2Right);
        expect(r.law1Left).toBe(a & b ? 0 : 1);
        expect(r.law2Left).toBe(a | b ? 0 : 1);
      }
  });
});
