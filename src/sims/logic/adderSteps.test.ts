import { describe, it, expect } from 'vitest';
import { buildRipple, buildCla } from '@/sims/logic/adderSteps';
import { rippleColumns } from '@/sims/logic/adders';
import { toBits } from '@/sims/logic/bits';

describe('buildRipple', () => {
  it('1011 + 0110 = 10001 (sum 0001 carry 1)', () => {
    const r = buildRipple({ a: '1011', b: '0110', width: 4, subtract: false });
    expect(r.error).toBeUndefined();
    const s = r.steps[r.steps.length - 1].state;
    expect(s.sum).toBe('0001');
    expect(s.carries).toEqual([0, 0, 1, 1, 1]);
    expect(s.carries[4]).toBe(1);
    expect(s.M).toBe(0);
    expect(s.Bx).toBe('0110');
  });

  it('one step per bit plus initial and result', () => {
    const r = buildRipple({ a: '1', b: '1', width: 6, subtract: false });
    expect(r.steps).toHaveLength(6 + 2);
    expect(r.steps.at(-1)!.state.A).toBe('000001');
  });

  it("subtract mode: 0111 - 0011 = 0100 via B XOR M and carry-in M", () => {
    const r = buildRipple({ a: '0111', b: '0011', width: 4, subtract: true });
    const s = r.steps.at(-1)!.state;
    expect(s.M).toBe(1);
    expect(s.Bx).toBe('1100');
    expect(s.carries[0]).toBe(1);
    expect(s.sum).toBe('0100');
    expect(s.carries[4]).toBe(1);
  });

  it('exhaustive 4-bit subtraction equals a - b mod 16', () => {
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++) {
        const s = buildRipple({ a: toBits(a, 4), b: toBits(b, 4), width: 4, subtract: true }).steps.at(-1)!.state;
        expect(s.sum).toBe(toBits(a - b, 4));
      }
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildRipple({ a: '1', b: '1', width: 1, subtract: false }),
      buildRipple({ a: '1', b: '1', width: 9, subtract: false }),
      buildRipple({ a: '12', b: '1', width: 4, subtract: false }),
      buildRipple({ a: '1', b: '11111', width: 4, subtract: false }),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});

describe('buildCla', () => {
  it('1011 + 0110: P, G, carries and sum', () => {
    const r = buildCla('1011', '0110', 0);
    expect(r.error).toBeUndefined();
    const s = r.steps.at(-1)!.state;
    expect(s.P).toEqual([1, 0, 1, 1]); // LSB first
    expect(s.G).toEqual([0, 1, 0, 0]);
    expect(s.carries).toEqual([0, 0, 1, 1, 1]);
    expect(s.sum).toBe('0001');
  });

  it('CLA carries and sum equal ripple for all 4-bit pairs and carry-ins', () => {
    for (let a = 0; a < 16; a++)
      for (let b = 0; b < 16; b++)
        for (const cin of [0, 1]) {
          const A = toBits(a, 4);
          const B = toBits(b, 4);
          const r = buildCla(A, B, cin);
          expect(r.error).toBeUndefined();
          const s = r.steps.at(-1)!.state;
          const rip = rippleColumns(A, B, cin);
          expect(s.carries).toEqual([cin, ...rip.columns.map((c) => c.cout)]);
          expect(s.sum).toBe(rip.sum);
          expect(s.carries[4]! * 16 + parseInt(s.sum, 2)).toBe(a + b + cin);
        }
  });

  it('rejects invalid input', () => {
    for (const r of [buildCla('10101', '1', 0), buildCla('1', 'x', 0)]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
