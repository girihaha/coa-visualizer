import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  buildBaseConversion,
  type BaseState,
  type Radix,
} from '@/sims/logic/baseConversion';

const RADIX_OPTIONS: { value: Radix; label: string }[] = [
  { value: 2,  label: 'Base 2 (Binary)' },
  { value: 8,  label: 'Base 8 (Octal)' },
  { value: 10, label: 'Base 10 (Decimal)' },
  { value: 16, label: 'Base 16 (Hex)' },
];

export function BaseConversionSim() {
  const [source, setSource] = useState<Radix>(10);
  const [target, setTarget] = useState<Radix>(2);
  const [integer, setInteger] = useState('46');
  const [fraction, setFraction] = useState('6875');
  const [maxFraction, setMaxFraction] = useState(8);
  const build = useMemo(
    () => buildBaseConversion({ source, target, integer, fraction, maxFraction }),
    [source, target, integer, fraction, maxFraction],
  );

  return (
    <SimLayout<BaseState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="base-source" label="Source number base">
            <Segmented
              label="Source base"
              value={source}
              options={RADIX_OPTIONS}
              onChange={setSource}
            />
          </Field>
          <Field id="base-target" label="Target number base">
            <Segmented
              label="Target base"
              value={target}
              options={RADIX_OPTIONS}
              onChange={setTarget}
            />
          </Field>
          <Field
            id="base-int"
            label="Integer part"
            hint={`Valid digits for base ${source}: ${source === 2 ? '0, 1' : source === 8 ? '0–7' : source === 10 ? '0–9' : '0–9, A–F'}`}
          >
            <input
              id="base-int"
              className={inputClass}
              value={integer}
              onChange={(e) => setInteger(e.target.value)}
            />
          </Field>
          <Field id="base-frac" label="Fractional part (optional)" hint="Digits after the radix point.">
            <input
              id="base-frac"
              className={inputClass}
              value={fraction}
              onChange={(e) => setFraction(e.target.value)}
            />
          </Field>
          <Field
            id="base-max"
            label="Max fractional digits"
            hint="Bounds repeating fractional expansions."
          >
            <input
              id="base-max"
              type="number"
              min={1}
              max={24}
              className={inputClass}
              value={maxFraction}
              onChange={(e) => setMaxFraction(Number(e.target.value))}
            />
          </Field>
        </>
      }
      assumptions={[
        'Positional notation: Value = ∑ (digit × base^position).',
        'Integer conversion to new base uses repeated integer division by target radix, collecting remainders in reverse order (bottom-up).',
        'Fractional conversion to new base uses repeated multiplication by target radix, collecting integer parts in natural order (top-down).',
      ]}
      visual={(step) => {
        const s = step.state;
        const currentDigits = `${s.digits || '—'}${s.fractionDigits ? '.' + s.fractionDigits : ''}`;

        return (
          <div className="flex flex-col gap-6">
            {/* Conversion Stage Card */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  Current Algorithm Working
                </span>
                <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">
                  Phase: {s.phase.toUpperCase()}
                </span>
              </div>
              <div className="mt-3 font-mono text-base font-semibold text-slate-800 break-words">
                {step.operation}
              </div>
              {step.condition && (
                <div className="mt-1 font-mono text-xs text-indigo-600">
                  ↳ {step.condition}
                </div>
              )}
            </div>

            {/* Collected Digits and Reverse Order Indicator */}
            {s.phase === 'integer' && s.digits && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-indigo-800 font-semibold mb-2">
                  Remainder Collection (Bottom-Up / Reverse Order)
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 font-mono text-lg font-bold">
                    {s.digits.split('').map((d, i) => (
                      <span
                        key={i}
                        className="flex h-10 w-9 items-center justify-center rounded border border-indigo-300 bg-white text-indigo-900 shadow-sm"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-indigo-700">
                    ← MSB (first remainder is LSB at right)
                  </span>
                </div>
              </div>
            )}

            {/* Status chips */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip
                label="Current Working Value"
                value={s.current || '—'}
                tone="indigo"
              />
              <ValueChip
                label="Accumulated Output Digits"
                value={currentDigits}
                tone={currentDigits !== '—' ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Conversion Pair"
                value={`Base ${source} → Base ${target}`}
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const inputStr = `${integer}${fraction ? '.' + fraction : ''}`;
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueChip
              label="Final representation"
              value={s.note || (s.digits ? `${s.digits}${s.fractionDigits ? '.' + s.fractionDigits : ''}` : 'In progress')}
              tone={s.note ? 'indigo' : 'neutral'}
            />
            <ValueChip
              label="Equation verification"
              value={s.note ? `${inputStr} (base ${source}) = ${s.note}` : 'Shown at result step'}
            />
          </div>
        );
      }}
    />
  );
}
