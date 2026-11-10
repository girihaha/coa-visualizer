import type { SimBuild, SimStep } from '@/engine/types';

export type Flynn = 'SISD' | 'SIMD' | 'MISD' | 'MIMD';

export const FLYNN: { id: Flynn; name: string; instructionStreams: 'single' | 'multiple'; dataStreams: 'single' | 'multiple'; description: string; example: string }[] = [
  { id: 'SISD', name: 'Single instruction, single data', instructionStreams: 'single', dataStreams: 'single', description: 'One control unit issues one instruction stream that operates on one data stream.', example: 'A conventional uniprocessor (von Neumann machine).' },
  { id: 'SIMD', name: 'Single instruction, multiple data', instructionStreams: 'single', dataStreams: 'multiple', description: 'One instruction stream is broadcast to several processing elements, each working on its own data.', example: 'Array and vector processors applying the same operation to many elements.' },
  { id: 'MISD', name: 'Multiple instruction, single data', instructionStreams: 'multiple', dataStreams: 'single', description: 'Several processing units apply different instruction streams to the same data stream.', example: 'Rarely built; discussed mainly for completeness of the taxonomy.' },
  { id: 'MIMD', name: 'Multiple instruction, multiple data', instructionStreams: 'multiple', dataStreams: 'multiple', description: 'Several processors each run their own instruction stream on their own data.', example: 'Multiprocessors and multicore systems.' },
];

export interface ArraySumState {
  lanes: number;
  values: number[];
  partials: (number | null)[];
  cursor: number[];
  phase: 'initial' | 'lanes' | 'combine' | 'done';
  timeStep: number;
  activeLanes: number[];
  total: number | null;
}

export function buildArraySum(opts: { values: string; lanes: number }): SimBuild<ArraySumState> {
  const parts = opts.values.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 16 || !parts.every((p) => /^-?\d+$/.test(p))) {
    return { steps: [], error: 'Enter 2 to 16 whole numbers separated by spaces or commas.' };
  }
  if (!Number.isInteger(opts.lanes) || opts.lanes < 1 || opts.lanes > 4) return { steps: [], error: 'Choose 1 to 4 lanes.' };
  const values = parts.map(Number);
  const lanes = Math.min(opts.lanes, values.length);
  const chunks = Array.from({ length: lanes }, (_, l) => values.map((_, i) => i).filter((i) => i % lanes === l));
  let s: ArraySumState = { lanes, values, partials: Array(lanes).fill(null), cursor: Array(lanes).fill(-1), phase: 'initial', timeStep: 0, activeLanes: [], total: null };
  const steps: SimStep<ArraySumState>[] = [
    {
      title: 'Initial state',
      operation: `${values.length} elements split across ${lanes} lane${lanes > 1 ? 's' : ''}`,
      changed: [],
      explanation: 'Element i goes to lane i mod lanes. Each lane adds its own elements independently, so the lanes can work at the same time (data-level parallelism).',
      state: s,
    },
  ];
  const longest = Math.max(...chunks.map((c) => c.length));
  for (let k = 0; k < longest; k++) {
    const partials = [...s.partials];
    const cursor = [...s.cursor];
    const active: number[] = [];
    const ops: string[] = [];
    chunks.forEach((chunk, l) => {
      if (k >= chunk.length) return;
      const idx = chunk[k];
      partials[l] = (partials[l] ?? 0) + values[idx];
      cursor[l] = idx;
      active.push(l);
      ops.push(`L${l}: += a[${idx}] -> ${partials[l]}`);
    });
    s = { ...s, partials, cursor, phase: 'lanes', timeStep: s.timeStep + 1, activeLanes: active };
    steps.push({
      title: `Time step ${s.timeStep}`,
      operation: ops.join('  ·  '),
      changed: active.map((l) => `lane ${l}`),
      explanation: `${active.length} lane${active.length > 1 ? 's' : ''} perform one addition each in this time step. There is no dependence between lanes, only within a lane.`,
      state: s,
    });
  }
  if (lanes > 1) {
    let level = s.partials.map((p) => p ?? 0);
    while (level.length > 1) {
      const nextLevel: number[] = [];
      const ops: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 < level.length) {
          nextLevel.push(level[i] + level[i + 1]);
          ops.push(`${level[i]} + ${level[i + 1]} = ${level[i] + level[i + 1]}`);
        } else nextLevel.push(level[i]);
      }
      level = nextLevel;
      const partials = [...level, ...Array(lanes - level.length).fill(null)];
      s = { ...s, partials, phase: 'combine', timeStep: s.timeStep + 1, activeLanes: level.map((_, i) => i) };
      steps.push({
        title: `Time step ${s.timeStep}: combine`,
        operation: ops.join('  ·  '),
        changed: ['partial sums'],
        explanation: 'Partial sums are combined pairwise. Each combine depends on results from the previous step, so this phase has fewer independent operations.',
        state: s,
      });
    }
  }
  const total = values.reduce((a, b) => a + b, 0);
  s = { ...s, phase: 'done', total, activeLanes: [] };
  steps.push({
    title: 'Result',
    operation: `Sum = ${total} in ${s.timeStep} time steps (sequential: ${values.length - 1} additions)`,
    changed: ['sum'],
    explanation: 'Time steps are counted under this simple model where each lane does one addition per step. Real speed also depends on memory, communication and overheads, which this model does not include.',
    state: s,
  });
  return { steps };
}

export interface CoreSlice {
  core: number;
  thread: string | null;
  remaining: number;
}

export interface MulticoreState {
  time: number;
  cores: CoreSlice[];
  remaining: Record<string, number>;
  done: string[];
  log: { time: number; core: number; thread: string }[];
}

export function buildMulticore(opts: { threads: string; cores: number; slice: number }): SimBuild<MulticoreState> {
  const parts = opts.threads.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 1 || parts.length > 8 || !parts.every((p) => /^\d+$/.test(p) && Number(p) >= 1 && Number(p) <= 9)) {
    return { steps: [], error: 'Enter 1 to 8 thread lengths (1 to 9 time units each), separated by spaces.' };
  }
  if (!Number.isInteger(opts.cores) || opts.cores < 1 || opts.cores > 4) return { steps: [], error: 'Choose 1 to 4 cores.' };
  if (!Number.isInteger(opts.slice) || opts.slice < 1 || opts.slice > 4) return { steps: [], error: 'Time slice must be 1 to 4 units.' };
  const names = parts.map((_, i) => `T${i + 1}`);
  const remaining: Record<string, number> = Object.fromEntries(names.map((n, i) => [n, Number(parts[i])]));
  const queues: string[][] = Array.from({ length: opts.cores }, (_, c) => names.filter((_, i) => i % opts.cores === c));
  const sliceLeft = Array(opts.cores).fill(0);
  const current: (string | null)[] = Array(opts.cores).fill(null);
  let s: MulticoreState = { time: 0, cores: current.map((t, c) => ({ core: c, thread: t, remaining: 0 })), remaining: { ...remaining }, done: [], log: [] };
  const steps: SimStep<MulticoreState>[] = [
    {
      title: 'Initial state',
      operation: `${names.length} threads on ${opts.cores} core${opts.cores > 1 ? 's' : ''}, slice = ${opts.slice}`,
      changed: [],
      explanation: `Threads are assigned to cores in turn (T1 to core 0, T2 to core 1, ...). Each core time-slices its own threads in round-robin order. Queues: ${queues.map((q, c) => `core ${c}: ${q.join(', ') || 'none'}`).join('; ')}.`,
      state: s,
    },
  ];
  let guard = 0;
  while (Object.values(remaining).some((r) => r > 0) && guard++ < 200) {
    const notes: string[] = [];
    for (let c = 0; c < opts.cores; c++) {
      if (current[c] && (remaining[current[c]!] === 0 || sliceLeft[c] === 0)) {
        if (remaining[current[c]!] > 0) queues[c].push(current[c]!);
        current[c] = null;
      }
      if (!current[c] && queues[c].length) {
        current[c] = queues[c].shift()!;
        sliceLeft[c] = opts.slice;
        notes.push(`core ${c} switches to ${current[c]}`);
      }
    }
    const log = [...s.log];
    const done = [...s.done];
    for (let c = 0; c < opts.cores; c++) {
      const t = current[c];
      if (!t) continue;
      remaining[t] -= 1;
      sliceLeft[c] -= 1;
      log.push({ time: s.time + 1, core: c, thread: t });
      if (remaining[t] === 0) {
        done.push(t);
        notes.push(`${t} finishes`);
      }
    }
    s = { time: s.time + 1, cores: current.map((t, c) => ({ core: c, thread: t, remaining: t ? remaining[t] : 0 })), remaining: { ...remaining }, done, log };
    steps.push({
      title: `Time ${s.time}`,
      operation: s.cores.map((c) => `core ${c}: ${c.thread ?? 'idle'}`).join('  ·  '),
      changed: s.cores.filter((c) => c.thread).map((c) => c.thread!),
      explanation: `${notes.length ? notes.join('; ') + '. ' : ''}Different cores run at the same moment; threads that share a core take turns.`,
      state: s,
    });
  }
  return { steps };
}
