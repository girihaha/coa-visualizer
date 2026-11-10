import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildShiftAdd, type ShiftAddState } from '@/sims/logic/shiftAdd';
import { fromBitsUnsigned } from '@/sims/logic/bits';

export function ShiftAddSim() {
  const [m, setM] = useState('9');
  const [q, setQ] = useState('12');
  const [n, setN] = useState(4);
  const build = useMemo(() => buildShiftAdd(m, q, n), [m, q, n]);

  return (
    <SimLayout<ShiftAddState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="sa-m" label="Multiplicand M (decimal)" hint={`Unsigned, 0 to ${(1 << n) - 1}.`}>
            <input
              id="sa-m"
              className={inputClass}
              value={m}
              onChange={(e) => setM(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="sa-q" label="Multiplier Q (decimal)" hint={`Unsigned, 0 to ${(1 << n) - 1}.`}>
            <input
              id="sa-q"
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="sa-n" label="Operand register bit width n">
            <Segmented
              label="Operand width"
              value={n}
              options={[4, 5, 6, 8].map((w) => ({ value: w, label: `${w} bits` }))}
              onChange={setN}
            />
          </Field>
        </>
      }
      assumptions={[
        'Unsigned binary multiplication via Shift-and-Add algorithm.',
        'Registers: Accumulator A (initialized to 0), Multiplier Q, Multiplicand M.',
        'Decision bit: In each cycle, LSB of Q (Q₀) is inspected. If 1, A ← A + M. Then right-shift combined [C : A : Q].',
        'Produces an exact 2n-bit product residing in concatenated [A : Q].',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-3">
                Multiplier &amp; Accumulator Registers
              </p>
              <div className="flex flex-col gap-3">
                <BitRow label="M (Multiplicand)" bits={s.M} />
                <BitRow
                  label="Q (Multiplier — active LSB Q₀ highlighted)"
                  bits={s.Q}
                  tone="indigo"
                  highlight={[s.Q.length - 1]}
                />
                <BitRow label="A (Accumulator Product)" bits={s.A} tone="amber" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip label="Iteration" value={`Step ${s.iteration} of ${s.n}`} tone="indigo" />
              <ValueChip label="Carry Out (C)" value={s.carry} />
              <ValueChip
                label="Step Decision"
                value={s.decision}
                tone={s.decision.includes('Add') ? 'indigo' : 'neutral'}
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const p = step.state.product;
        return (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Product bits (2n bits in [A : Q])"
                value={p ?? 'Available upon algorithm completion'}
                tone={p ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Product (decimal)"
                value={p ? fromBitsUnsigned(p).toString() : '—'}
                tone={p ? 'indigo' : 'neutral'}
              />
            </div>
            {p && (
              <p className="text-xs text-slate-500 font-mono border-t border-slate-100 pt-2">
                Verification: {m} × {q} = <strong className="text-slate-800">{fromBitsUnsigned(p)}</strong>
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
