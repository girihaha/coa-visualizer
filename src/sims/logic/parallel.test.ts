import { describe, it, expect } from 'vitest';
import { FLYNN, buildArraySum, buildMulticore } from '@/sims/logic/parallel';

describe('Flynn taxonomy', () => {
  it('covers the four instruction/data stream combinations', () => {
    const combos = FLYNN.map((f) => `${f.instructionStreams}-${f.dataStreams}`).sort();
    expect(combos).toEqual(['multiple-multiple', 'multiple-single', 'single-multiple', 'single-single']);
    expect(FLYNN.find((f) => f.id === 'SIMD')).toMatchObject({ instructionStreams: 'single', dataStreams: 'multiple' });
  });
});

describe('data-parallel array sum', () => {
  it('computes the correct sum for every lane count', () => {
    for (const lanes of [1, 2, 3, 4]) {
      const end = buildArraySum({ values: '3 8 1 6 4 9 2 7', lanes }).steps.at(-1)!.state;
      expect(end.total).toBe(40);
      expect(end.phase).toBe('done');
    }
  });

  it('more lanes take fewer time steps', () => {
    const steps = (lanes: number) => buildArraySum({ values: '3 8 1 6 4 9 2 7', lanes }).steps.at(-1)!.state.timeStep;
    expect(steps(4)).toBeLessThan(steps(2));
    expect(steps(2)).toBeLessThan(steps(1));
  });

  it('handles negative numbers', () => {
    expect(buildArraySum({ values: '-5, 3, 2', lanes: 2 }).steps.at(-1)!.state.total).toBe(0);
  });

  it('rejects invalid input', () => {
    expect(buildArraySum({ values: '1', lanes: 2 }).error).toBeTruthy();
    expect(buildArraySum({ values: '1 x 3', lanes: 2 }).error).toBeTruthy();
    expect(buildArraySum({ values: '1 2', lanes: 9 }).error).toBeTruthy();
  });
});

describe('multicore scheduling', () => {
  it('runs every unit of work exactly once', () => {
    const end = buildMulticore({ threads: '3 2 4 2 3', cores: 2, slice: 2 }).steps.at(-1)!.state;
    expect(end.log).toHaveLength(14);
    expect(end.done.sort()).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    expect(Object.values(end.remaining).every((r) => r === 0)).toBe(true);
  });

  it('never runs two threads on one core at the same time', () => {
    const { log } = buildMulticore({ threads: '3 2 4 2 3', cores: 2, slice: 1 }).steps.at(-1)!.state;
    const keys = log.map((l) => `${l.time}-${l.core}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('single core takes the total work; more cores finish sooner', () => {
    const time = (cores: number) => buildMulticore({ threads: '3 3 3 3', cores, slice: 2 }).steps.at(-1)!.state.time;
    expect(time(1)).toBe(12);
    expect(time(2)).toBe(6);
    expect(time(4)).toBe(3);
  });

  it('assigns threads to cores in turn', () => {
    const { log } = buildMulticore({ threads: '1 1 1', cores: 2, slice: 1 }).steps.at(-1)!.state;
    expect(log.filter((l) => l.thread === 'T2').every((l) => l.core === 1)).toBe(true);
    expect(log.filter((l) => l.thread === 'T3').every((l) => l.core === 0)).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(buildMulticore({ threads: '0 2', cores: 2, slice: 1 }).error).toBeTruthy();
    expect(buildMulticore({ threads: '2', cores: 5, slice: 1 }).error).toBeTruthy();
    expect(buildMulticore({ threads: '2', cores: 1, slice: 0 }).error).toBeTruthy();
  });
});
