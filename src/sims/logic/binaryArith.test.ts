import { describe, it, expect } from 'vitest';
import { buildBinaryArith } from '@/sims/logic/binaryArith';
import { fromBitsSigned, toBits } from '@/sims/logic/bits';

const final = (a: string, b: string, w: number, mode: 'add' | 'sub-1s' | 'sub-2s') => {
  const r = buildBinaryArith(a, b, w, mode);
  expect(r.error).toBeUndefined();
  return r.steps[r.steps.length - 1].state;
};

describe('buildBinaryArith', () => {
  it('adds 1011 + 0110 = 10001 (sum 0001, carry 1)', () => {
    const s = final('1011', '0110', 4, 'add');
    expect(s.result).toBe('0001');
    expect(s.carryOut).toBe(1);
  });

  it('pads short operands to width', () => {
    const s = final('11', '1', 8, 'add');
    expect(s.A).toBe('00000011');
    expect(s.result).toBe('00000100');
    expect(s.carryOut).toBe(0);
  });

  it("2's complement subtraction: 7 - 3 = 4 and 3 - 7 = -4", () => {
    let s = final('0111', '0011', 4, 'sub-2s');
    expect(s.Bc).toBe('1100');
    expect(s.carryIn).toBe(1);
    expect(s.result).toBe('0100');
    expect(s.carryOut).toBe(1);
    expect(s.overflow).toBe(false);
    s = final('0011', '0111', 4, 'sub-2s');
    expect(s.result).toBe('1100');
    expect(s.carryOut).toBe(0);
    expect(s.overflow).toBe(false);
  });

  it('detects signed overflow', () => {
    expect(final('0111', '0001', 4, 'add').overflow).toBe(true); // 7 + 1
    expect(final('1000', '1000', 4, 'add').overflow).toBe(true); // -8 + -8
    expect(final('1000', '0001', 4, 'sub-2s').overflow).toBe(true); // -8 - 1
    expect(final('0111', '1111', 4, 'sub-2s').overflow).toBe(true); // 7 - (-1)
    expect(final('0011', '0010', 4, 'add').overflow).toBe(false);
  });

  it("exhaustive 4-bit add and 2's complement subtract match arithmetic and overflow rule", () => {
    for (let a = -8; a <= 7; a++) {
      for (let b = -8; b <= 7; b++) {
        const add = final(toBits(a, 4), toBits(b, 4), 4, 'add');
        expect(add.result).toBe(toBits(a + b, 4));
        expect(add.overflow).toBe(a + b < -8 || a + b > 7);
        const sub = final(toBits(a, 4), toBits(b, 4), 4, 'sub-2s');
        expect(sub.result).toBe(toBits(a - b, 4));
        expect(sub.overflow).toBe(a - b < -8 || a - b > 7);
      }
    }
  });

  it("1's complement subtraction with end-around carry: 0110 - 0011 = 0011", () => {
    const s = final('0110', '0011', 4, 'sub-1s');
    expect(s.Bc).toBe('1100');
    expect(s.sum).toBe('0010');
    expect(s.endAround).toBe(true);
    expect(s.result).toBe('0011');
  });

  it("1's complement subtraction without carry gives negative result: 0011 - 0110 = 1100 (-3)", () => {
    const s = final('0011', '0110', 4, 'sub-1s');
    expect(s.endAround).toBe(false);
    expect(s.result).toBe('1100');
  });

  it("1's complement A - A gives negative zero", () => {
    expect(final('0101', '0101', 4, 'sub-1s').result).toBe('1111');
  });

  it("1's complement subtraction of non-negative 4-bit values is correct", () => {
    for (let a = 0; a <= 7; a++) {
      for (let b = 0; b <= 7; b++) {
        const r = final(toBits(a, 4), toBits(b, 4), 4, 'sub-1s').result!;
        // decode 1's complement
        const v = r[0] === '1' ? -Number(fromBitsSigned('0' + r.replace(/[01]/g, (c) => (c === '0' ? '1' : '0')))) : Number(fromBitsSigned('0' + r));
        expect(v + 0).toBe(a - b); // +0 normalises 1's complement negative zero
      }
    }
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildBinaryArith('1012', '1', 4, 'add'),
      buildBinaryArith('11111', '1', 4, 'add'),
      buildBinaryArith('1', '1', 3, 'add'),
      buildBinaryArith('1', '1', 17, 'add'),
      buildBinaryArith('', '1', 4, 'add'),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
