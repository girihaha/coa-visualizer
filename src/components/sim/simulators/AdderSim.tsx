import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildCla, buildRipple, type AdderState } from '@/sims/logic/adderSteps';

type Circuit = 'ripple' | 'cla';

const WIDTH = 4;

export function RippleAdderSim() {
  return <AdderSim circuit="ripple" />;
}

export function CarryLookaheadSim() {
  return <AdderSim circuit="cla" />;
}

export function AdderSim({ circuit }: { circuit: Circuit }) {
  const [a, setA] = useState('1011');
  const [b, setB] = useState('0110');
  const [subtract, setSubtract] = useState(false);
  const build = useMemo(
    () =>
      circuit === 'cla'
        ? buildCla(a, b, 0)
        : buildRipple({ a, b, width: WIDTH, subtract }),
    [circuit, a, b, subtract],
  );

  return (
    <SimLayout<AdderState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="add-a" label="Operand A (4 bits)" hint="Binary digits (0 or 1).">
            <input
              id="add-a"
              className={inputClass}
              value={a}
              onChange={(e) => setA(e.target.value)}
              maxLength={8}
            />
          </Field>
          <Field id="add-b" label="Operand B (4 bits)" hint="Binary digits (0 or 1).">
            <input
              id="add-b"
              className={inputClass}
              value={b}
              onChange={(e) => setB(e.target.value)}
              maxLength={8}
            />
          </Field>
          {circuit === 'ripple' && (
            <Field id="add-mode" label="Adder/Subtractor Mode M">
              <Segmented
                label="Mode"
                value={subtract ? 'sub' : 'add'}
                options={[
                  { value: 'add', label: 'Add (M=0, B uncomplemented)' },
                  { value: 'sub', label: 'Subtract (M=1, B complemented)' },
                ]}
                onChange={(v) => setSubtract(v === 'sub')}
              />
            </Field>
          )}
        </>
      }
      assumptions={[
        'Fixed 4-bit parallel adder design.',
        circuit === 'cla'
          ? 'Carry-Lookahead Adder (CLA): Carries are generated simultaneously using Gi = Ai·Bi and Pi = Ai ⊕ Bi. Carry propagation delay is independent of bit width.'
          : 'Ripple-Carry Adder: Carry from full adder i cascades serially into full adder i+1, incurring linear propagation delay proportional to n.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                {circuit === 'cla' ? 'Carry-Lookahead Adder Stage' : 'Ripple-Carry Adder Stage'}
              </p>
              <div className="flex flex-col gap-3">
                <BitRow label="Operand A" bits={s.A} />
                <BitRow
                  label={subtract && circuit === 'ripple' ? 'Operand B (complemented via XOR)' : 'Operand B'}
                  bits={s.Bx}
                  tone="indigo"
                />
                <div className="border-t-2 border-slate-300 pt-3">
                  <BitRow label="Sum Output (S)" bits={s.sum} tone="amber" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Carries C₀..C₄"
                value={s.carries.map((c) => (c === null ? '?' : c)).join(' ')}
                tone="indigo"
              />
              <ValueChip
                label="Generate (G) &amp; Propagate (P)"
                value={`G = ${s.G.map((g) => g ?? '?').join('')}  |  P = ${s.P.map((p) => p ?? '?').join('')}`}
              />
            </div>
          </div>
        );
      }}
    />
  );
}
