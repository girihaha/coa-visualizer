import type { SimBuild, SimStep } from '@/engine/types';

export type Endian = 'big' | 'little';

export interface MemoryState {
  locations: number;
  addressBits: number;
  endian: Endian;
  start: number;
  bytes: { address: number; value: string }[];
  note: string;
}

export const UNIT_BYTES = { B: 1n, KB: 1n << 10n, MB: 1n << 20n, GB: 1n << 30n } as const;
export type CapacityUnit = keyof typeof UNIT_BYTES;

export function addressBitsFor(locations: bigint): number {
  if (locations <= 1n) return 0;
  return (locations - 1n).toString(2).length;
}

export function buildMemoryLayout(opts: {
  value: string;
  wordBytes: 1 | 2 | 4;
  endian: Endian;
  start: number;
  capacityAmount: number;
  capacityUnit: CapacityUnit;
}): SimBuild<MemoryState> {
  const { value, wordBytes, endian, start, capacityAmount, capacityUnit } = opts;
  if (!Number.isInteger(capacityAmount) || capacityAmount < 1) {
    return { steps: [], error: 'Capacity must be a whole number of 1 or more.' };
  }
  const text = value.trim();
  const isHex = /^0x[0-9a-f]+$/i.test(text);
  if (!isHex && !/^\d+$/.test(text)) return { steps: [], error: 'Word value must be a decimal number or a hex value such as 0x1A2B3C4D.' };
  const v = BigInt(text);
  const bits = BigInt(wordBytes * 8);
  if (v >= 1n << bits) return { steps: [], error: `The value does not fit in ${wordBytes} bytes.` };
  if (!Number.isInteger(start) || start < 0) return { steps: [], error: 'Start address must be a whole number of 0 or more.' };

  const locations = BigInt(capacityAmount) * UNIT_BYTES[capacityUnit];
  const addressBits = addressBitsFor(locations);
  const hexBytes = Array.from({ length: wordBytes }, (_, i) => {
    const shift = BigInt((wordBytes - 1 - i) * 8);
    return ((v >> shift) & 0xffn).toString(16).toUpperCase().padStart(2, '0');
  });
  const order = endian === 'big' ? hexBytes : [...hexBytes].reverse();
  const steps: SimStep<MemoryState>[] = [];
  const base = { endian, locations: Number(locations), addressBits, start };
  const note = `${locations.toString()} byte locations need ${addressBits} address bits (ceil log2 N).`;

  steps.push({
    title: 'Address space',
    operation: `${capacityAmount} ${capacityUnit} = ${locations.toString()} bytes`,
    condition: 'Assumes byte addressing: one address per byte.',
    changed: [`${addressBits} address bits`],
    explanation: 'The number of address bits is the smallest n with 2^n at least the number of locations.',
    state: { ...base, bytes: [], note },
  });
  steps.push({
    title: 'Split the word',
    operation: `0x${hexBytes.join('')} is ${wordBytes} bytes: ${hexBytes.join(' ')} (most significant first)`,
    changed: [],
    explanation: 'The word is split into bytes from most significant to least significant before they are placed in memory.',
    state: { ...base, bytes: [], note },
  });
  const placed: { address: number; value: string }[] = [];
  order.forEach((b, i) => {
    placed.push({ address: start + i, value: b });
    steps.push({
      title: `Place byte ${i + 1} of ${wordBytes}`,
      operation: `Address ${start + i} <- ${b}`,
      changed: [`address ${start + i}`],
      explanation:
        endian === 'big'
          ? 'Big-endian: the most significant byte goes to the lowest address.'
          : 'Little-endian: the least significant byte goes to the lowest address.',
      state: { ...base, bytes: [...placed], note },
    });
  });
  return { steps };
}
