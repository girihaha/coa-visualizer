import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  buildBinaryArith,
  type ArithMode,
  type BinaryArithState,
} from '@/sims/logic/binaryArith';

const MODES: { value: ArithMode; label: string }[] = [
  { value: 'add',    label: 'A + B (Binary Addition)' },
  { value: 'sub-1s', label: 'A − B (1s Complement)' },
  { value: 'sub-2s', label: 'A − B (2s Complement)' },
];

const WIDTH = 5;

export function BinaryArithSim() {
  const [a, setA] = useState('01101');
  const [b, setB] = useState('00111');
  const [mode, setMode] = useState<ArithMode>('sub-2s');
  const build = useMemo(() => buildBinaryArith(a, b, WIDTH, mode), [a, b, mode]);

  return (
    <SimLayout<BinaryArithState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="arith-a" label="Operand A (5 bits)" hint="Binary digits (0 or 1).">
            <input
              id="arith-a"
              className={inputClass}
              value={a}
              onChange={(e) => setA(e.target.value)}
              maxLength={8}
            />
          </Field>
          <Field id="arith-b" label="Operand B (5 bits)" hint="Binary digits (0 or 1).">
            <input
              id="arith-b"
              className={inputClass}
              value={b}
              onChange={(e) => setB(e.target.value)}
              maxLength={8}
            />
          </Field>
          <Field id="arith-mode" label="Arithmetic operation">
            <Segmented label="Operation" value={mode} options={MODES} onChange={setMode} />
          </Field>
        </>
      }
      assumptions={[
        'Fixed register width of 5 bits.',
        '1s complement subtraction: Invert B and add. If there is an end-around carry, add it back to the LSB.',
        "2s complement subtraction: Invert B and add 1 (B' + 1), then add to A. Discard end carry for magnitude.",
        'Unsigned carry out is reported separately from signed overflow (V flag).',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">
                Column-Aligned Operands
              </p>
              <div className="flex flex-col gap-3">
                <BitRow label="Operand A" bits={s.A} />
                <BitRow
                  label={mode === 'add' ? 'Operand B' : 'Subtrahend B (complemented)'}
                  bits={s.Bc}
                  tone="indigo"
                />
                <div className="border-t-2 border-slate-300 pt-3">
                  <BitRow label="Accumulator Sum" bits={s.sum} tone="amber" />
                </div>
              </div>
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        return (
          <div className="grid gap-3 sm:grid-cols-3">
            <ValueChip
              label="Final bit result"
              value={s.result ?? 'Shown after final column'}
              tone={s.result ? 'indigo' : 'neutral'}
            />
            <ValueChip
              label="Carry-out (C)"
              value={s.carryOut === null ? '—' : String(s.carryOut)}
            />
            <ValueChip
              label="Signed Overflow (V)"
              value={s.overflow === null ? '—' : s.overflow ? 'YES (overflow)' : 'No'}
              tone={s.overflow ? 'red' : 'neutral'}
            />
          </div>
        );
      }}
    />
  );
}
