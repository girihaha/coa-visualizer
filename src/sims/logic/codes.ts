import type { SimBuild, SimStep } from '@/engine/types';

export type CodeMode = 'bcd' | 'xs3' | 'gray-encode' | 'gray-decode' | 'ascii' | 'parity';
export type ParityType = 'even' | 'odd';

export interface CodeState {
  mode: CodeMode;
  input: string;
  groups: string[];
  output: string | null;
  note: string;
}

const CODE_MODES = ['bcd', 'xs3', 'gray-encode', 'gray-decode', 'ascii', 'parity'] as const;
export const CODE_LABELS: Record<CodeMode, string> = {
  bcd: 'BCD (decimal digits)',
  xs3: 'Excess-3 (decimal digits)',
  'gray-encode': 'Binary to Gray',
  'gray-decode': 'Gray to binary',
  ascii: 'ASCII characters',
  parity: 'Parity bit',
};
export { CODE_MODES };

function bitsOf(value: number, width: number): string {
  return value.toString(2).padStart(width, '0');
}

export function buildCodes(mode: CodeMode, input: string, parity: ParityType = 'even'): SimBuild<CodeState> {
  const text = input.trim();
  const steps: SimStep<CodeState>[] = [];
  const snap = (groups: string[], output: string | null, note: string): CodeState => ({
    mode,
    input: text,
    groups,
    output,
    note,
  });

  if (mode === 'bcd' || mode === 'xs3') {
    if (!/^\d+$/.test(text)) return { steps: [], error: 'Enter decimal digits only, such as 2024.' };
    const digits = text.split('');
    const offset = mode === 'xs3' ? 3 : 0;
    const groups: string[] = [];
    digits.forEach((d, i) => {
      const code = bitsOf(Number(d) + offset, 4);
      groups.push(code);
      steps.push({
        title: `Digit ${i + 1} of ${digits.length}`,
        operation: `${d} -> ${code}`,
        condition: offset ? `${d} + 3 = ${Number(d) + 3}` : undefined,
        changed: [code],
        explanation: offset
          ? `Excess-3 encodes each decimal digit as its 4-bit value plus 3.`
          : `BCD encodes each decimal digit separately as a 4-bit group.`,
        state: snap([...groups], null, ''),
      });
    });
    const output = groups.join(' ');
    steps.push({
      title: 'Result',
      operation: `${text} -> ${output}`,
      changed: [],
      explanation: 'All digit groups are shown with a space between them.',
      state: snap(groups, output, `${groups.length} groups of 4 bits`),
    });
    return { steps };
  }

  if (mode === 'gray-encode') {
    if (!/^[01]+$/.test(text)) return { steps: [], error: 'Enter a binary number made of 0 and 1.' };
    const b = text;
    const groups: string[] = [];
    for (let i = 0; i < b.length; i++) {
      const g = i === 0 ? b[0] : String(Number(b[i - 1]) ^ Number(b[i]));
      groups.push(g);
      steps.push({
        title: `Bit ${i}`,
        operation: i === 0 ? `Copy MSB: g = ${g}` : `g = b(${i - 1}) XOR b(${i}) = ${b[i - 1]} XOR ${b[i]} = ${g}`,
        changed: [g],
        explanation: i === 0 ? 'The most significant Gray bit is copied from the binary MSB.' : 'Each further Gray bit is the XOR of two adjacent binary bits.',
        state: snap([...groups], null, ''),
      });
    }
    const output = groups.join('');
    steps.push({ title: 'Result', operation: `${b} -> ${output}`, changed: [], explanation: 'Adjacent Gray codes differ in one bit.', state: snap(groups, output, '') });
    return { steps };
  }

  if (mode === 'gray-decode') {
    if (!/^[01]+$/.test(text)) return { steps: [], error: 'Enter a Gray code made of 0 and 1.' };
    const g = text;
    const groups: string[] = [];
    for (let i = 0; i < g.length; i++) {
      const b = i === 0 ? g[0] : String(Number(groups[i - 1]) ^ Number(g[i]));
      groups.push(b);
      steps.push({
        title: `Bit ${i}`,
        operation: i === 0 ? `Copy MSB: b = ${b}` : `b(${i}) = b(${i - 1}) XOR g(${i}) = ${groups[i - 1]} XOR ${g[i]} = ${b}`,
        changed: [b],
        explanation: 'Gray to binary uses cumulative XOR: each binary bit is the previous binary bit XOR the current Gray bit.',
        state: snap([...groups], null, ''),
      });
    }
    const output = groups.join('');
    steps.push({ title: 'Result', operation: `${g} -> ${output}`, changed: [], explanation: 'The binary value is recovered from the Gray code.', state: snap(groups, output, '') });
    return { steps };
  }

  if (mode === 'ascii') {
    if (text.length === 0) return { steps: [], error: 'Enter at least one character.' };
    if ([...text].some((ch) => ch.charCodeAt(0) > 127)) return { steps: [], error: 'ASCII covers only 7-bit characters (codes 0 to 127).' };
    const groups: string[] = [];
    [...text].forEach((ch, i) => {
      const code = bitsOf(ch.charCodeAt(0), 7);
      groups.push(code);
      steps.push({
        title: `Character ${i + 1}`,
        operation: `'${ch}' -> decimal ${ch.charCodeAt(0)} -> ${code}`,
        changed: [code],
        explanation: 'Each character is encoded as a 7-bit ASCII code.',
        state: snap([...groups], null, ''),
      });
    });
    const output = groups.join(' ');
    steps.push({ title: 'Result', operation: output, changed: [], explanation: 'Each group is one character.', state: snap(groups, output, '') });
    return { steps };
  }

  if (!/^[01]+$/.test(text)) return { steps: [], error: 'Enter a binary word made of 0 and 1.' };
  const ones = [...text].filter((c) => c === '1').length;
  const bit = parity === 'even' ? ones % 2 : 1 - (ones % 2);
  steps.push({
    title: 'Count ones',
    operation: `${ones} one(s) in ${text}`,
    changed: [],
    explanation: `For ${parity} parity the appended bit makes the total number of 1s ${parity}.`,
    state: snap([text], null, `${ones} ones`),
  });
  steps.push({
    title: 'Append parity bit',
    operation: `Parity bit = ${bit}`,
    changed: [String(bit)],
    explanation:
      'A single parity bit detects an odd number of flipped bits. It cannot tell which bit flipped, so it cannot correct the error.',
    state: snap([text, String(bit)], `${text}${bit}`, `${parity} parity`),
  });
  return { steps };
}
