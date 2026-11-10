import { describe, it, expect } from 'vitest';
import { buildDatapath, type DatapathInput } from '@/sims/logic/datapath';

const base: DatapathInput = { program: 'add-indirect', pc: '100', r1: '7', r3: '200', operand: '35', offset: '40', r4: '12', r5: '30' };
const final = (input: Partial<DatapathInput>) => {
  const b = buildDatapath({ ...base, ...input });
  expect(b.error).toBeUndefined();
  return { steps: b.steps, end: b.steps[b.steps.length - 1].state };
};

describe('datapath control sequences', () => {
  it('Add (R3), R1 leaves R1 + [R3] in R1 and advances PC by 4', () => {
    const { end, steps } = final({});
    expect(end.regs.R1).toBe(42);
    expect(end.PC).toBe(104);
    expect(steps.some((s) => s.state.signals.includes('WMFC'))).toBe(true);
  });

  it('single-bus fetch begins with PCout, MARin', () => {
    const { steps } = final({});
    const first = steps.find((s) => s.state.signals.length > 0)!;
    expect(first.state.signals).toEqual(expect.arrayContaining(['PCout', 'MARin']));
  });

  it('branch adds the offset to the updated PC', () => {
    expect(final({ program: 'branch', offset: '40' }).end.PC).toBe(144);
    expect(final({ program: 'branch', offset: '-24' }).end.PC).toBe(80);
  });

  it('three-bus Add R4, R5, R6 writes R4 + R5 into R6', () => {
    expect(final({ program: 'three-bus' }).end.regs.R6).toBe(42);
  });

  it('rejects addresses that are not word aligned', () => {
    const b = buildDatapath({ ...base, pc: '102' });
    expect(b.error).toMatch(/multiples of 4/);
    expect(b.steps).toHaveLength(0);
  });

  it('rejects non-numeric input', () => {
    expect(buildDatapath({ ...base, r1: 'abc' }).error).toBeTruthy();
  });
});
