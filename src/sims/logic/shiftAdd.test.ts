import { describe, it, expect } from 'vitest';
import { buildShiftAdd } from '@/sims/logic/shiftAdd';

describe('buildShiftAdd', () => {
  it('13 x 11 = 143 in 4 bits', () => {
    const r = buildShiftAdd('13', '11', 4);
    expect(r.error).toBeUndefined();
    const s = r.steps[r.steps.length - 1].state;
    expect(s.M).toBe('1101');
    expect(s.product).toBe('10001111');
    expect(parseInt(s.product!, 2)).toBe(143);
    expect(s.A + s.Q).toBe('10001111');
    expect(s.iteration).toBe(4);
  });

  it('exhaustive 4-bit unsigned products', () => {
    for (let m = 0; m < 16; m++)
      for (let q = 0; q < 16; q++) {
        const s = buildShiftAdd(String(m), String(q), 4).steps.at(-1)!.state;
        expect(s.product).toHaveLength(8);
        expect(parseInt(s.product!, 2)).toBe(m * q);
      }
  });

  it('8-bit: 255 x 255 = 65025', () => {
    const s = buildShiftAdd('255', '255', 8).steps.at(-1)!.state;
    expect(parseInt(s.product!, 2)).toBe(65025);
  });

  it('rejects invalid input', () => {
    for (const r of [
      buildShiftAdd('-1', '3', 4),
      buildShiftAdd('16', '3', 4),
      buildShiftAdd('3', 'x', 4),
      buildShiftAdd('3', '3', 1),
      buildShiftAdd('3', '3', 9),
    ]) {
      expect(r.error).toBeTruthy();
      expect(r.steps).toHaveLength(0);
    }
  });
});
