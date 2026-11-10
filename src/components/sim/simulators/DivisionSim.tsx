import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildDivision, type DivisionMode, type DivisionState } from '@/sims/logic/division';
import { fromBitsSigned } from '@/sims/logic/bits';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';

const DIVISION_NODES: FlowNode[] = [
  { id: 'start',   label: 'Start',                                      x: 220, y: 30,  kind: 'terminal' },
  { id: 'init',    label: 'Initialize A=0, Q=Dividend, M=Divisor',       x: 220, y: 95,  kind: 'process' },
  { id: 'shift',   label: 'Shift [A : Q] left 1 position',              x: 220, y: 165, kind: 'process' },
  { id: 'sub',     label: 'A ← A − M',                                  x: 220, y: 235, kind: 'process' },
  { id: 'sign',    label: 'Sign bit of A = 1 (A < 0)?',                 x: 220, y: 310, kind: 'decision' },
  { id: 'restore', label: 'Q₀ ← 0; A ← A + M (Restore)',                x: 470, y: 310, kind: 'process' },
  { id: 'keep',    label: 'Q₀ ← 1 (Divisor fits)',                      x: 220, y: 390, kind: 'process' },
  { id: 'count',   label: 'Iterations = n ?',                           x: 220, y: 460, kind: 'decision' },
  { id: 'end',     label: 'Result: Q=Quotient, A=Remainder',            x: 470, y: 460, kind: 'terminal' },
];

const DIVISION_EDGES: FlowEdge[] = [
  { from: 'start',   to: 'init' },
  { from: 'init',    to: 'shift' },
  { from: 'shift',   to: 'sub' },
  { from: 'sub',     to: 'sign' },
  { from: 'sign',    to: 'restore', label: 'yes (A < 0)' },
  { from: 'sign',    to: 'keep',    label: 'no (A ≥ 0)' },
  { from: 'restore', to: 'count',   via: [[580, 310], [580, 460]] },
  { from: 'keep',    to: 'count' },
  { from: 'count',   to: 'end',     label: 'yes' },
  { from: 'count',   to: 'shift',   label: 'no', via: [[50, 460], [50, 165]] },
];

function divFlowState(title: string, mode: DivisionMode) {
  if (title === 'Initial state') return { active: ['start', 'init'], visited: [] };
  if (title.startsWith('Result')) return { active: ['end'], visited: ['start', 'init', 'shift'] };
  if (title.includes('shift left')) return { active: ['shift'], visited: ['init'] };
  if (title.includes('trial subtract') || title.includes('subtract')) {
    return { active: ['sub', 'sign'], visited: ['shift'] };
  }
  if (title.includes('restore') || title.includes('restores')) {
    return { active: ['restore'], visited: ['sub', 'sign'] };
  }
  if (title.includes('keep') || title.includes('set bit 1') || title.includes('fits')) {
    return { active: ['keep'], visited: ['sub', 'sign'] };
  }
  return { active: ['count'], visited: ['shift'] };
}

export function DivisionSim() {
  const [dividend, setDividend] = useState('13');
  const [divisor, setDivisor] = useState('4');
  const [n, setN] = useState(4);
  const [mode, setMode] = useState<DivisionMode>('restoring');
  const build = useMemo(
    () => buildDivision(dividend, divisor, n, mode),
    [dividend, divisor, n, mode],
  );

  return (
    <SimLayout<DivisionState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="div-dividend" label="Dividend (numerator)">
            <input
              id="div-dividend"
              className={inputClass}
              value={dividend}
              onChange={(e) => setDividend(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="div-divisor" label="Divisor (denominator)" hint="Must be 1 or more (no division by zero).">
            <input
              id="div-divisor"
              className={inputClass}
              value={divisor}
              onChange={(e) => setDivisor(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="div-n" label="Register bit width n">
            <Segmented
              label="Operand width"
              value={n}
              options={[4, 5, 6, 8].map((w) => ({ value: w, label: `${w} bits` }))}
              onChange={setN}
            />
          </Field>
          <Field id="div-mode" label="Division algorithm method">
            <Segmented
              label="Method"
              value={mode}
              options={[
                { value: 'restoring',     label: 'Restoring' },
                { value: 'non-restoring', label: 'Non-restoring' },
              ]}
              onChange={setMode}
            />
          </Field>
        </>
      }
      assumptions={[
        'Unsigned binary operands; divisor must be ≥ 1.',
        'Registers: A holds partial remainder (widened to n+2 bits to detect negative borrow), Q holds dividend / quotient, M holds divisor.',
        'Restoring: A trial subtraction A ← A − M is performed; if A < 0, A is restored (A ← A + M) and Q₀ = 0; if A ≥ 0, Q₀ = 1.',
        'Non-restoring: If previous partial remainder was positive, subtract M; if negative, add M; correction applied if final remainder is negative.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            {/* Register state table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <caption className="mb-1 text-left font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Register state ([A : Q] combined)
                </caption>
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600 w-24">
                      Register
                    </th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600">
                      Value (Binary)
                    </th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600 w-28">
                      Signed Dec
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="even:bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                      A (Remainder)
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      <BitRow label="" bits={s.A} tone="indigo" />
                    </td>
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700">
                      {fromBitsSigned(s.A)}
                    </td>
                  </tr>
                  <tr className="even:bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                      Q (Dividend/Quot)
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      <BitRow label="" bits={s.Q} tone="amber" />
                    </td>
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700">
                      {fromBitsSigned(`0${s.Q}`)}
                    </td>
                  </tr>
                  <tr className="even:bg-slate-50">
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs font-semibold text-slate-700">
                      M (Divisor)
                    </td>
                    <td className="border border-slate-200 px-3 py-2">
                      <BitRow label="" bits={s.M} />
                    </td>
                    <td className="border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700">
                      {fromBitsSigned(s.M)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status chips */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip label="Divisor (M)" value={`${fromBitsSigned(s.M)} (0b${s.M})`} />
              <ValueChip label="Iteration" value={`${s.iteration} of ${s.n}`} tone="indigo" />
              <ValueChip
                label="Operation"
                value={s.operation}
                tone={s.operation.includes('restore') ? 'amber' : s.operation.includes('subtract') ? 'indigo' : 'neutral'}
              />
            </div>

            {/* Algorithm Flowchart */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                {mode === 'restoring' ? 'Restoring' : 'Non-Restoring'} division flowchart
              </p>
              <Flowchart
                title="Integer division flowchart"
                width={680}
                height={510}
                nodes={DIVISION_NODES}
                edges={DIVISION_EDGES}
                {...divFlowState(step.title, mode)}
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const qDec = s.quotient ? fromBitsSigned(`0${s.quotient}`) : null;
        const rDec = s.remainder !== null ? fromBitsSigned(s.A) : null;
        return (
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Quotient Q (binary &amp; decimal)"
                value={qDec !== null ? `${s.quotient} (decimal ${qDec})` : 'Computing…'}
                tone={qDec !== null ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Remainder A (binary &amp; decimal)"
                value={rDec !== null ? `${s.remainder} (decimal ${rDec})` : 'Computing…'}
                tone={rDec !== null ? 'indigo' : 'neutral'}
              />
            </div>
            {qDec !== null && rDec !== null && (
              <p className="text-xs text-slate-600 border-t border-slate-100 pt-2 font-mono">
                Verification: Dividend ({dividend}) = (Divisor {divisor} × Quotient {qDec}) + Remainder {rDec} = {Number(divisor) * Number(qDec) + Number(rDec)}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
