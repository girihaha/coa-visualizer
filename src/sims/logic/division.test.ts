import { describe, it, expect } from 'vitest';
import { buildDivision, type DivisionMode } from '@/sims/logic/division';
import { fromBitsSigned } from '@/sims/logic/bits';

const run = (d: string, v: string, n: number, mode: DivisionMode) => {
  const r = buildDivision(d, v, n, mode);
  expect(r.error).toBeUndefined();
  const s = r.steps[r.steps.length - 1].state;
  return { s, q: parseInt(s.quotient, 2), rem: Number(fromBitsSigned(s.remainder!)) };
};

describe('buildDivision', () => {
  it('13 / 4 = 3 remainder 1 in both modes', () => {
    for (const mode of ['restoring', 'non-restoring'] as const) {
      const { s, q, rem } = run('13', '4', 4, mode);
      expect(s.quotient).toBe('0011');
      expect(s.Q).toBe('0011');
      expect(q).toBe(3);
      expect(rem).toBe(1);
      expect(s.remainder).toBe('000001');
    }
  });

  it('restoring and non-restoring agree and are correct for all 4-bit pairs', () => {
    for (let d = 0; d < 16; d++)
      for (let v = 1; v < 16; v++) {
        const a = run(String(d), String(v), 4, 'restoring');
        const b = run(String(d), String(v), 4, 'non-restoring');
        expect(a.q).toBe(Math.floor(d / v));
        expect(a.rem).toBe(d % v);
        expect(b.q).toBe(a.q);
        expect(b.rem).toBe(a.rem);
      }
  });

  it('8-bit: 255 / 7 = 36 r 3', () => {
    for (const mode of ['restoring', 'non-restoring'] as const) {
      const { q, rem } = run('255', '7', 8, mode);
      expect(q).toBe(36);
      expect(rem).toBe(3);
    }
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildDivision('13', '0', 4, 'restoring'),
      buildDivision('-1', '3', 4, 'restoring'),
      buildDivision('16', '3', 4, 'non-restoring'),
      buildDivision('a', '3', 4, 'restoring'),
      buildDivision('3', '3', 1, 'restoring'),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
