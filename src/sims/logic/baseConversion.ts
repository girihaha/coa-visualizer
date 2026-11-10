import type { SimBuild, SimStep } from '@/engine/types';

export type Radix = 2 | 8 | 10 | 16;
const DIGITS = '0123456789ABCDEF';

export interface BaseState {
  phase: 'validate' | 'expand' | 'integer' | 'fraction' | 'result' | 'check';
  current: string;
  digits: string;
  fractionDigits: string;
  note: string;
}

export interface BaseInput {
  source: Radix;
  target: Radix;
  integer: string;
  fraction: string;
  maxFraction: number;
}

export function parseRadixDigits(text: string, radix: number): bigint | null {
  let acc = 0n;
  const b = BigInt(radix);
  for (const ch of text.toUpperCase()) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= radix) return null;
    acc = acc * b + BigInt(d);
  }
  return acc;
}

export function parseFraction(text: string, radix: number): { num: bigint; den: bigint } | null {
  if (text.length === 0) return { num: 0n, den: 1n };
  const num = parseRadixDigits(text, radix);
  if (num === null) return null;
  return { num, den: BigInt(radix) ** BigInt(text.length) };
}

export function toRadixString(value: bigint, radix: number): string {
  return value.toString(radix).toUpperCase();
}

function decimalFractionString(num: bigint, den: bigint): string | null {
  for (let k = 0; k <= 60; k++) {
    const scale = 10n ** BigInt(k);
    if ((num * scale) % den === 0n) {
      const digits = ((num * scale) / den).toString().padStart(k, '0');
      return k === 0 ? '0' : digits;
    }
  }
  return null;
}

export function buildBaseConversion(input: BaseInput): SimBuild<BaseState> {
  const { source, target, maxFraction } = input;
  const intText = input.integer.trim() || '0';
  const fracText = input.fraction.trim();
  if (!Number.isInteger(maxFraction) || maxFraction < 1 || maxFraction > 24) {
    return { steps: [], error: 'Fractional digit limit must be between 1 and 24.' };
  }
  const intValue = parseRadixDigits(intText, source);
  if (intValue === null) {
    return { steps: [], error: `The integer part contains a digit that is not valid in base ${source}.` };
  }
  const frac = parseFraction(fracText, source);
  if (frac === null) {
    return { steps: [], error: `The fractional part contains a digit that is not valid in base ${source}.` };
  }

  const steps: SimStep<BaseState>[] = [];
  const base = (phase: BaseState['phase'], over: Partial<BaseState> = {}): BaseState => ({
    phase,
    current: toRadixString(intValue, target),
    digits: '',
    fractionDigits: '',
    note: '',
    ...over,
  });

  steps.push({
    title: 'Validate input',
    operation: `Source ${source} → target ${target}`,
    condition: `Integer ${intText.toUpperCase()}${fracText ? '.' + fracText.toUpperCase() : ''} (base ${source})`,
    changed: [],
    explanation: `Every digit is valid for base ${source}. Digits are limited to 0 to ${source - 1} (${DIGITS.slice(0, source)}).`,
    state: base('validate'),
  });

  let decimalInt = intValue;
  if (source !== 10) {
    const pieces = intText
      .toUpperCase()
      .split('')
      .map((ch, i, arr) => ({ ch, weight: arr.length - 1 - i, d: DIGITS.indexOf(ch) }));
    let running = 0n;
    pieces.forEach((p) => {
      running = running * BigInt(source) + BigInt(p.d);
      steps.push({
        title: `Expand digit ${p.ch} (position ${p.weight})`,
        operation: `${p.d} × ${source}^${p.weight} contributes ${BigInt(p.d) * BigInt(source) ** BigInt(p.weight)}`,
        condition: `Running decimal value = ${running}`,
        changed: ['Running value'],
        explanation: `Each digit is multiplied by its place weight ${source}^${p.weight}. Horner's rule keeps the running total, which is the same as summing the weights.`,
        state: base('expand', { current: running.toString(), digits: intText.toUpperCase() }),
      });
    });
    decimalInt = running;
  }

  let decimalFrac = frac;
  if (fracText && source !== 10) {
    const str = decimalFractionString(frac!.num, frac!.den);
    if (str === null) return { steps: [], error: 'This fraction does not have a finite decimal form.' };
    steps.push({
      title: 'Fraction expanded to decimal',
      operation: `0.${fracText.toUpperCase()} (base ${source}) = 0.${str} (base 10)`,
      condition: 'Exact value',
      changed: ['Decimal fraction'],
      explanation: 'Each fraction digit is weighted by a negative power of the source base. The sum is exact because the base-2, 8 and 16 expansions terminate in decimal.',
      state: base('expand', { current: decimalInt.toString(), fractionDigits: str }),
    });
    decimalFrac = { num: BigInt(str), den: 10n ** BigInt(str.length) };
  }

  const tgt = BigInt(target);
  let intDigits = '';
  if (target === 10) {
    intDigits = decimalInt.toString();
  } else if (source === target) {
    intDigits = toRadixString(intValue, target);
  } else {
    let n = decimalInt;
    const remainders: string[] = [];
    if (n === 0n) remainders.push('0');
    let iter = 0;
    while (n > 0n) {
      iter++;
      const q = n / tgt;
      const r = n % tgt;
      const rd = DIGITS[Number(r)];
      remainders.push(rd);
      steps.push({
        title: `Integer division ${iter}`,
        operation: `${n} ÷ ${target} = ${q} remainder ${rd}`,
        condition: `Remainder digit ${rd} is collected`,
        changed: ['Quotient', 'Remainder digit'],
        explanation: `Dividing by ${target} gives the next lower place value. The remainder ${rd} becomes the next output digit, counting from the right.`,
        state: base('integer', { current: q.toString(), digits: remainders.slice().reverse().join('') }),
      });
      n = q;
    }
    intDigits = remainders.reverse().join('');
  }

  const fracOut: string[] = [];
  let repeatFrom: number | null = null;
  let truncated = false;
  if (decimalFrac && decimalFrac.num !== 0n && target !== 10) {
    let num = decimalFrac.num;
    const den = decimalFrac.den;
    const seen = new Map<string, number>();
    let i = 0;
    while (num !== 0n && i < maxFraction) {
      const key = num.toString();
      const prior = seen.get(key);
      if (prior !== undefined) {
        repeatFrom = prior;
        break;
      }
      seen.set(key, i);
      num = num * tgt;
      const d = num / den;
      num = num % den;
      fracOut.push(DIGITS[Number(d)]);
      i++;
      steps.push({
        title: `Fraction multiplication ${i}`,
        operation: `Fraction × ${target} → digit ${DIGITS[Number(d)]}, remaining fraction ${num === 0n ? '0' : `${num}/${den}`}`,
        condition: num === 0n ? 'Fraction is now zero, so the expansion terminates' : `Digits so far: ${fracOut.join('')}`,
        changed: ['Fraction digit', 'Remaining fraction'],
        explanation: `Multiplying the fractional part by ${target} moves the next digit to the left of the radix point. That integer part is the next output digit.`,
        state: base('fraction', { fractionDigits: fracOut.join('') }),
      });
    }
    truncated = repeatFrom === null && num !== 0n;
  }
  if (target === 10 && fracText) {
    const str = decimalFractionString(decimalFrac!.num, decimalFrac!.den);
    if (str !== null) fracOut.push(...str.split(''));
  }

  const exact = fracText === '' || (repeatFrom === null && !truncated);
  const fracPrefix = repeatFrom === null ? fracOut.join('') : fracOut.slice(0, repeatFrom).join('');
  const fracCycle = repeatFrom === null ? '' : fracOut.slice(repeatFrom).join('');
  const fracString = repeatFrom === null ? fracOut.join('') + (truncated ? '…' : '') : `${fracPrefix}(${fracCycle})`;
  const result = fracString ? `${intDigits}.${fracString}` : intDigits;

  const back = parseRadixDigits(intDigits, target);
  const intOk = back === intValue;
  const fracBack = exact ? parseFraction(fracOut.join(''), target) : null;
  const fracOk = fracText === '' || (exact && fracBack !== null && frac !== null && fracBack.num * frac.den === frac.num * fracBack.den);
  steps.push({
    title: 'Result',
    operation: `${intText.toUpperCase()}${fracText ? '.' + fracText.toUpperCase() : ''} (base ${source}) = ${result} (base ${target})`,
    condition: exact
      ? 'Exact conversion'
      : repeatFrom !== null
        ? 'Repeating fraction: the block in parentheses repeats forever'
        : `Truncated after ${maxFraction} fraction digits`,
    changed: ['Result'],
    explanation: exact
      ? 'The conversion is exact. The result is the integer digits followed by the fraction digits.'
      : repeatFrom !== null
        ? 'The remainder returned to an earlier value, so the digits in parentheses repeat without end. This is why some decimal fractions have no finite form in base 2.'
        : 'The fraction does not terminate within the digit limit. Raise the limit to see more digits.',
    state: base('result', { digits: intDigits, fractionDigits: fracString, note: result }),
  });

  steps.push({
    title: 'Reverse check',
    operation: `Convert ${result} back to base ${source}`,
    condition: intOk ? 'Integer part reconstructs exactly' : 'Integer part does NOT reconstruct',
    changed: [],
    explanation: `Reading the base-${target} digits back gives ${back?.toString() ?? 'an invalid value'} (decimal), which ${
      intOk ? 'matches' : 'does not match'
    } the original integer. ${
      fracText === ''
        ? ''
        : exact
          ? fracOk
            ? 'The fraction also reconstructs exactly.'
            : 'The fraction does not reconstruct.'
          : repeatFrom !== null
            ? 'The fraction repeats; the parenthesized block is the repeating cycle.'
            : 'The fraction is truncated, so only the shown digits can be checked.'
    }`,
    state: base('check', { digits: intDigits, fractionDigits: fracString, note: result }),
  });
  return { steps };
}
