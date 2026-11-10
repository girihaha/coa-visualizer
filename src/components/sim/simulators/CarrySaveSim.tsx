import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildCarrySave, type CarrySaveState } from '@/sims/logic/carrySave';
import { fromBitsUnsigned } from '@/sims/logic/bits';

export function CarrySaveSim() {
  const [text, setText] = useState('0101, 0011, 0110');
  const build = useMemo(() => buildCarrySave(text), [text]);

  return (
    <SimLayout<CarrySaveState>
      steps={build.steps}
      error={build.error}
      inputs={
        <Field
          id="cs-summands"
          label="Binary summands (comma separated)"
          hint="Three to six binary numbers of equal bit length."
        >
          <textarea
            id="cs-summands"
            rows={3}
            className={`${inputClass} resize-y leading-relaxed`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
      }
      assumptions={[
        'Carry-Save Adder (CSA): Reduces 3 operand rows into 2 rows (Sum row + Carry row) in 1 adder delay without carry propagation.',
        'Carries are saved and passed to the next higher significance column in the next stage without rippling.',
        'Final two rows are combined using a standard carry-propagate adder.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-indigo-600 font-semibold">
                  {s.label}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  Round {s.round}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {s.rows.map((r, i) => (
                  <BitRow
                    key={i}
                    label={`Row ${i + 1}`}
                    bits={r}
                    tone={i % 2 === 0 ? 'neutral' : 'indigo'}
                  />
                ))}
              </div>
            </div>
            <ValueChip label="Reduction Round" value={`Stage ${s.round}`} tone="indigo" />
          </div>
        );
      }}
      output={(step) => {
        const f = step.state.finalSum;
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueChip
              label="Final Sum bits (binary)"
              value={f ?? 'Shown after the final reduction round'}
              tone={f ? 'indigo' : 'neutral'}
            />
            <ValueChip
              label="Final Sum (decimal)"
              value={f ? fromBitsUnsigned(f).toString() : '—'}
              tone={f ? 'indigo' : 'neutral'}
            />
          </div>
        );
      }}
    />
  );
}
