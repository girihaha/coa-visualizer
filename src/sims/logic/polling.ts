import type { SimBuild, SimStep } from '@/engine/types';

export type IoMapping = 'memory-mapped' | 'io-mapped';

export const STATUS_ADDRESS = 0x4004;
export const DATA_ADDRESS = 0x4000;
export const BUFFER_START = 0x1000;

export interface PollingState {
  mapping: IoMapping;
  chars: string[];
  index: number;
  sin: 0 | 1;
  waitLeft: number;
  dataReg: string;
  R0: string;
  buffer: string[];
  pc: 'poll' | 'test' | 'read' | 'store' | 'idle';
  statusReads: number;
  bus: 'address' | 'io' | null;
}

export function buildPolling(opts: { text: string; delay: number; mapping: IoMapping }): SimBuild<PollingState> {
  const chars = [...opts.text];
  if (chars.length < 1 || chars.length > 6) return { steps: [], error: 'Enter 1 to 6 characters for the device to deliver.' };
  if (!Number.isInteger(opts.delay) || opts.delay < 0 || opts.delay > 4) return { steps: [], error: 'Device delay must be 0 to 4 status checks per character.' };
  const mm = opts.mapping === 'memory-mapped';
  const readStatus = mm ? `Load R1, STATUS (address 0x${STATUS_ADDRESS.toString(16).toUpperCase()})` : 'In R1, STATUS_PORT';
  const readData = mm ? `Load R0, DATAIN (address 0x${DATA_ADDRESS.toString(16).toUpperCase()})` : 'In R0, DATA_PORT';
  const bus = mm ? 'address' : 'io';

  let s: PollingState = { mapping: opts.mapping, chars, index: 0, sin: 0, waitLeft: opts.delay, dataReg: '', R0: '', buffer: [], pc: 'idle', statusReads: 0, bus: null };
  const steps: SimStep<PollingState>[] = [
    {
      title: 'Initial state',
      operation: mm ? 'Device registers share the memory address space' : 'Device registers have a separate I/O port space',
      changed: [],
      explanation: mm
        ? 'Memory-mapped I/O: STATUS and DATAIN have ordinary addresses, so normal Load/Store instructions reach them.'
        : 'I/O-mapped I/O: device registers are selected by port numbers with special In/Out instructions, separate from memory addresses.',
      state: s,
    },
  ];
  const push = (step: Omit<SimStep<PollingState>, 'state'>, patch: Partial<PollingState>) => {
    s = { ...s, ...patch };
    steps.push({ ...step, state: s });
  };

  chars.forEach((ch, i) => {
    let wait = opts.delay;
    s = { ...s, index: i, waitLeft: wait };
    for (;;) {
      const ready = wait === 0;
      if (ready && s.sin === 0) s = { ...s, sin: 1, dataReg: ch };
      push(
        { title: `Char ${i + 1}: read status`, operation: `${readStatus}  ->  SIN = ${s.sin}`, changed: ['R1'], explanation: 'The processor reads the device status register. The SIN flag shows whether a new character is ready.' },
        { pc: 'poll', statusReads: s.statusReads + 1, bus },
      );
      push(
        { title: `Char ${i + 1}: test flag`, operation: s.sin ? 'SIN = 1: continue to read the data' : 'SIN = 0: branch back and check again', condition: s.sin ? 'Ready' : 'Not ready', changed: [], explanation: s.sin ? 'The device is ready, so the loop exits.' : 'The device is not ready. In program-controlled I/O the processor simply repeats the check; it does no useful work while waiting.' },
        { pc: 'test', bus: null },
      );
      if (s.sin) break;
      wait -= 1;
      s = { ...s, waitLeft: wait };
    }
    push(
      { title: `Char ${i + 1}: read data`, operation: `${readData}  ->  R0 = "${ch}"`, changed: ['R0', 'SIN'], explanation: 'Reading the data register transfers the character and clears SIN, telling the device it may supply the next character.' },
      { pc: 'read', R0: ch, sin: 0, bus },
    );
    push(
      { title: `Char ${i + 1}: store`, operation: `Store R0, buffer[${i}] (address 0x${(BUFFER_START + i).toString(16).toUpperCase()})`, changed: [`buffer[${i}]`], explanation: 'The character is saved in the memory buffer and the pointer advances.' },
      { pc: 'store', buffer: [...s.buffer, ch], bus: 'address', dataReg: '' },
    );
  });
  push(
    { title: 'Transfer complete', operation: `${chars.length} characters moved using ${s.statusReads} status reads`, changed: [], explanation: 'Every extra status read is time the processor spent waiting. The device delay values here are illustrative.' },
    { pc: 'idle', bus: null },
  );
  return { steps };
}
