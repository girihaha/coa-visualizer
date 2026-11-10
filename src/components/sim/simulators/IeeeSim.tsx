import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildIeee754, type IeeeState } from '@/sims/logic/ieee754';

const DEFAULT_VALUE = '46.6875';

const FIELD_EXPLANATIONS: Record<string, { title: string; desc: string }> = {
  sign: {
    title: 'Sign bit (bit 31)',
    desc: '0 = positive, 1 = negative. Unlike two\'s complement, floating point uses sign-magnitude representation.',
  },
  exponent: {
    title: 'Biased exponent (bits 30–23, 8 bits)',
    desc: 'Biased representation with bias = 127. Stored value = actual power of 2 + 127. Values 0 and 255 are reserved for zero/subnormals and infinity/NaN.',
  },
  fraction: {
    title: 'Fraction / Significand (bits 22–0, 23 bits)',
    desc: 'Bits to the right of the binary radix point. In normalized numbers, an implicit leading 1 is assumed (1.fraction), giving 24 bits of precision.',
  },
};

export function IeeeSim() {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [selectedField, setSelectedField] = useState<'sign' | 'exponent' | 'fraction' | null>(null);
  const build = useMemo(() => buildIeee754(value), [value]);

  return (
    <SimLayout<IeeeState>
      steps={build.steps}
      error={build.error}
      inputs={
        <Field
          id="ieee-value"
          label="Decimal value"
          hint="Finite value with an exact binary form, such as 46.6875 or -0.375."
        >
          <input
            id="ieee-value"
            className={inputClass}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
          />
        </Field>
      }
      assumptions={[
        'Single precision only (32 bits): 1 sign bit, 8 exponent bits, 23 fraction bits.',
        'Bias is 127. The stored exponent is the unbiased exponent plus 127.',
        'Normal finite values only. Values needing rounding and special values are not encoded here.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-5">
            {/* Bit-field visual table */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                IEEE 754 bit-field layout (click a field to inspect)
              </p>
              <div className="grid gap-2 sm:grid-cols-[100px_1fr_2fr]">
                <button
                  type="button"
                  onClick={() => setSelectedField(selectedField === 'sign' ? null : 'sign')}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedField === 'sign'
                      ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                    Sign (1 bit)
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                    {s.sign || '—'}
                  </p>
                  <p className="text-[10px] text-slate-400">Bit 31</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedField(selectedField === 'exponent' ? null : 'exponent')}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedField === 'exponent'
                      ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                    Exponent (8 bits)
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-indigo-700 tracking-wider">
                    {s.exponent || '————————'}
                  </p>
                  <p className="text-[10px] text-slate-400">Bits 30–23</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedField(selectedField === 'fraction' ? null : 'fraction')}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedField === 'fraction'
                      ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                    Fraction (23 bits)
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-700 break-all">
                    {s.fraction || '———————————————————————'}
                  </p>
                  <p className="text-[10px] text-slate-400">Bits 22–0</p>
                </button>
              </div>

              {/* Field explanation banner */}
              {selectedField && (
                <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm">
                  <p className="font-mono text-xs font-semibold text-indigo-800">
                    {FIELD_EXPLANATIONS[selectedField].title}
                  </p>
                  <p className="mt-1 text-xs text-indigo-700">
                    {FIELD_EXPLANATIONS[selectedField].desc}
                  </p>
                </div>
              )}
            </div>

            {/* Arithmetic breakdown */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip label="Binary value" value={s.binary || '—'} />
              <ValueChip
                label="Unbiased exponent"
                value={s.unbiased === null ? '—' : String(s.unbiased)}
              />
              <ValueChip
                label="Stored exponent (E + 127)"
                value={
                  s.unbiased === null
                    ? '—'
                    : `${s.unbiased} + 127 = ${s.unbiased + s.bias}`
                }
                tone="indigo"
              />
            </div>

            {s.bits && (
              <BitRow label="Complete 32-bit word" bits={s.bits} tone="indigo" />
            )}
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <ValueChip
            label="32-bit IEEE 754 encoding"
            value={step.state.bits || 'Shown after the fraction is formed'}
            tone={step.state.bits ? 'indigo' : 'neutral'}
          />
          <ValueChip label="Verification check" value={step.state.note || '—'} />
        </div>
      )}
    />
  );
}
