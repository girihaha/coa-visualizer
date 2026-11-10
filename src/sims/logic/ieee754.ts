import type { SimBuild, SimStep } from '@/engine/types';

export interface IeeeState {
  sign: string;
  binary: string;
  exponent: string;
  fraction: string;
  bias: number;
  unbiased: number | null;
  bits: string;
  note: string;
}

const BIAS = 127;

export function buildIeee754(text: string): SimBuild<IeeeState> {
  const t = text.trim();
  const m = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t);
  if (!m) return { steps: [], error: 'Enter a decimal number such as 46.6875 or -0.375.' };
  const negative = m[1] === '-';
  const intPart = m[2];
  const fracPart = m[3] ?? '';
  const den10 = 10n ** BigInt(fracPart.length);
  const numRaw = BigInt(intPart + fracPart);
  const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
  const g = gcd(numRaw, den10) || 1n;
  const num = numRaw / g;
  const den = den10 / g;
  if (den & (den - 1n)) {
    return { steps: [], error: 'This value has no exact binary form, so it needs rounding. Enter a value with a finite binary expansion, such as 46.6875 or 0.375.' };
  }
  const k = den.toString(2).length - 1;
  const sign = negative ? '1' : '0';
  const base = { sign, bias: BIAS, bits: '', fraction: '', exponent: '', binary: '', unbiased: null as number | null };
  const steps: SimStep<IeeeState>[] = [];

  if (num === 0n) {
    const bits = sign + '0'.repeat(31);
    return {
      steps: [
        {
          title: 'Zero',
          operation: `${t} is ${negative ? 'negative ' : ''}zero`,
          changed: [],
          explanation:
            'Zero is a special value: exponent field and fraction field are all zeros. The sign bit is kept, so -0 is encoded with sign 1.',
          state: { ...base, sign, exponent: '00000000', fraction: '0'.repeat(23), bits, note: negative ? 'Special value: negative zero' : 'Special value: zero', binary: '0' },
        },
      ],
    };
  }

  const intBits = (num >> BigInt(k)).toString(2);
  const fracBits = k === 0 ? '' : (num & ((1n << BigInt(k)) - 1n)).toString(2).padStart(k, '0');
  const binary = fracBits ? `${intBits}.${fracBits}` : intBits;
  steps.push({
    title: 'Sign',
    operation: `Sign bit = ${sign} (${negative ? 'negative' : 'positive'})`,
    changed: ['sign'],
    explanation: 'The sign bit is 0 for positive values and 1 for negative values.',
    state: { ...base, binary, note: '' },
  });
  steps.push({
    title: 'Binary value',
    operation: `${t} = ${binary} (binary)`,
    changed: [],
    explanation: 'The magnitude is written in binary. The fraction part is exact because the denominator is a power of two.',
    state: { ...base, binary, note: '' },
  });

  const L = num.toString(2);
  const significand = L.slice(1);
  const actualExp = L.length - 1 - k;
  if (significand.replace(/0+$/, '').length > 23) {
    return { steps: [], error: 'This value needs more than 24 significant binary digits, so single-precision rounding would apply. Use a value with fewer significant bits.' };
  }
  const stored = actualExp + BIAS;
  if (stored < 1 || stored > 254) return { steps: [], error: 'The exponent is outside the normal single-precision range (-126 to 127).' };
  const exponent = stored.toString(2).padStart(8, '0');
  const fraction = significand.padEnd(23, '0');
  const bits = `${sign}${exponent}${fraction}`;

  steps.push({
    title: 'Normalize',
    operation: `${binary} = 1.${significand || '0'} x 2^${actualExp}`,
    changed: ['exponent'],
    explanation: 'The leading 1 is implicit, so only the bits after the point are stored in the fraction field.',
    state: { ...base, binary, unbiased: actualExp, note: '' },
  });
  steps.push({
    title: 'Biased exponent',
    operation: `${actualExp} + ${BIAS} = ${stored} = ${exponent}`,
    condition: `Bias 127 for single precision`,
    changed: ['exponent'],
    explanation: 'The stored exponent is the unbiased exponent plus 127.',
    state: { ...base, binary, unbiased: actualExp, exponent, note: '' },
  });
  steps.push({
    title: 'Fraction field',
    operation: `Fraction = ${fraction}`,
    changed: ['fraction'],
    explanation: 'The 23 bits after the implicit leading 1, padded with zeros.',
    state: { ...base, binary, unbiased: actualExp, exponent, fraction, bits, note: '' },
  });
  const check = new DataView(new ArrayBuffer(4));
  check.setFloat32(0, Number(t));
  const reference = check.getUint32(0).toString(2).padStart(32, '0');
  const matches = reference === bits;
  steps.push({
    title: 'Check',
    operation: matches ? 'Matches the hardware single-precision encoding' : 'Does not match the encoding',
    changed: [],
    explanation: 'The result is compared with the single-precision encoding produced by the browser for the same value.',
    state: { ...base, binary, unbiased: actualExp, exponent, fraction, bits, note: matches ? 'Verified' : 'Mismatch' },
  });
  return { steps };
}
