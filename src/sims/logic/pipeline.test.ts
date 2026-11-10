import { describe, it, expect } from 'vitest';
import { buildPipeline, parseProgram, schedule, totalCycles } from '@/sims/logic/pipeline';

const cycles = (program: string, forwarding = false, missLine = 0, missPenalty = 0) => {
  const { instrs, error } = parseProgram(program);
  expect(error).toBeUndefined();
  return schedule(instrs, forwarding, missLine, missPenalty);
};

describe('pipeline parser', () => {
  it('reads registers, loads, branches and NOPs', () => {
    const { instrs } = parseProgram('ADD R1, R2, R3\nLOAD R4, (R1)\nBR 4\nNOP');
    expect(instrs.map((i) => i.op)).toEqual(['ADD', 'LOAD', 'BR', 'NOP']);
    expect(instrs[1]).toMatchObject({ dest: 'R4', srcs: ['R1'] });
    expect(instrs[2].branchTo).toBe(4);
  });

  it('rejects unknown instructions, bad operands and backward branches', () => {
    expect(parseProgram('JMP 3').error).toBeTruthy();
    expect(parseProgram('ADD R1, R2').error).toBeTruthy();
    expect(parseProgram('NOP\nBR 1').error).toBeTruthy();
    expect(parseProgram('').error).toBeTruthy();
    expect(parseProgram(Array(9).fill('NOP').join('\n')).error).toBeTruthy();
  });
});

describe('pipeline timing', () => {
  it('independent instructions take k + n - 1 cycles', () => {
    expect(totalCycles(cycles('ADD R1, R2, R3\nSUB R4, R5, R6\nOR R7, R8, R9'))).toBe(6);
  });

  it('a data hazard stalls until the producer writes back', () => {
    const t = cycles('ADD R1, R2, R3\nSUB R4, R1, R5');
    expect(t[1].D).toEqual([3, 4]);
    expect(t[1].E).toEqual([5, 5]);
    expect(totalCycles(t)).toBe(6);
  });

  it('forwarding removes the stall', () => {
    const t = cycles('ADD R1, R2, R3\nSUB R4, R1, R5', true);
    expect(t[1].E).toEqual([4, 4]);
    expect(totalCycles(t)).toBe(5);
  });

  it('a taken branch flushes the wrong-path instruction', () => {
    const t = cycles('BR 3\nADD R1, R2, R3\nSUB R4, R5, R6');
    const flushed = t.filter((x) => x.flushed);
    expect(flushed).toHaveLength(1);
    expect(flushed[0].instr.line).toBe(2);
    expect(t.filter((x) => !x.flushed).map((x) => x.instr.line)).toEqual([1, 3]);
    expect(totalCycles(t)).toBe(6);
  });

  it('a cache miss lengthens fetch and delays the following instruction', () => {
    const t = cycles('ADD R1, R2, R3\nSUB R4, R5, R6', false, 1, 2);
    expect(t[0].F).toEqual([1, 3]);
    expect(totalCycles(t)).toBe(7);
  });
});

describe('pipeline steps', () => {
  it('produces one step per cycle plus the empty start', () => {
    const b = buildPipeline({ program: 'ADD R1, R2, R3\nSUB R4, R1, R5', forwarding: false, missLine: 0, missPenalty: 0 });
    expect(b.steps).toHaveLength(7);
    expect(b.baseline).toBe(6);
    expect(b.steps.some((s) => s.explanation.includes('data hazard'))).toBe(true);
  });

  it('reports forwarding events when enabled', () => {
    const b = buildPipeline({ program: 'ADD R1, R2, R3\nSUB R4, R1, R5', forwarding: true, missLine: 0, missPenalty: 0 });
    expect(b.steps.flatMap((s) => s.state.forwards)).toEqual([{ from: 1, to: 2, reg: 'R1' }]);
  });

  it('validates the cache-miss penalty', () => {
    expect(buildPipeline({ program: 'NOP', forwarding: false, missLine: 1, missPenalty: 9 }).error).toBeTruthy();
  });
});
