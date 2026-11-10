import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { BitRow, Field, ValueChip, inputClass } from '@/components/sim/Bits';
import { buildBooth, type BoothState } from '@/sims/logic/booth';
import { fromBitsSigned } from '@/sims/logic/bits';
import { Flowchart, type FlowEdge, type FlowNode } from '@/components/sim/Flowchart';

const BOOTH_NODES: FlowNode[] = [
  { id: 'start',   label: 'Start',                x: 220, y: 30,  kind: 'terminal'  },
  { id: 'inspect', label: 'Inspect Q\u2080 Q\u208b\u2081', x: 220, y: 100, kind: 'process'   },
  { id: 'd01',     label: 'Pair = 01 ?',          x: 220, y: 180, kind: 'decision'  },
  { id: 'add',     label: 'A = A + M',            x: 470, y: 180, kind: 'process'   },
  { id: 'd10',     label: 'Pair = 10 ?',          x: 220, y: 260, kind: 'decision'  },
  { id: 'sub',     label: 'A = A \u2212 M',       x: 470, y: 260, kind: 'process'   },
  { id: 'noop',    label: 'No operation',         x: 220, y: 340, kind: 'process'   },
  { id: 'shift',   label: 'Arith. right shift A,Q,Q\u208b\u2081', x: 220, y: 420, kind: 'process' },
  { id: 'count',   label: 'Count = n ?',          x: 220, y: 490, kind: 'decision'  },
  { id: 'end',     label: 'Product = A\u2225Q',   x: 500, y: 490, kind: 'terminal'  },
];

const BOOTH_EDGES: FlowEdge[] = [
  { from: 'start',   to: 'inspect' },
  { from: 'inspect', to: 'd01' },
  { from: 'd01',     to: 'add',     label: 'yes (01)' },
  { from: 'd01',     to: 'd10',     label: 'no' },
  { from: 'd10',     to: 'sub',     label: 'yes (10)' },
  { from: 'd10',     to: 'noop',    label: 'no (00/11)' },
  { from: 'add',     to: 'shift',   via: [[580, 180], [580, 420]] },
  { from: 'sub',     to: 'shift',   via: [[580, 260], [580, 420]] },
  { from: 'noop',    to: 'shift' },
  { from: 'shift',   to: 'count' },
  { from: 'count',   to: 'end',     label: 'yes' },
  { from: 'count',   to: 'inspect', label: 'no', via: [[60, 490], [60, 100]] },
];

function boothFlowState(title: string, pair: string, iteration: number, n: number) {
  if (title === 'Initial state') return { active: ['start'], visited: [] };
  if (title.startsWith('Result'))
    return { active: ['end'], visited: ['start', 'inspect'] };
  const path =
    pair === '01'
      ? ['d01', 'add']
      : pair === '10'
      ? ['d01', 'd10', 'sub']
      : ['d01', 'd10', 'noop'];
  if (title.includes('inspect')) return { active: ['inspect'], visited: [] };
  if (title.includes('arithmetic right shift')) {
    return {
      active: ['shift'],
      visited: ['inspect', ...path, ...(iteration >= n ? ['count'] : [])],
    };
  }
  const op = path[path.length - 1];
  return { active: [op], visited: ['inspect', ...path.slice(0, -1)] };
}

// Booth decision rule reference table
function BoothDecisionTable({ activePair }: { activePair: string }) {
  const rows = [
    { q0: '0', qm1: '0', op: 'No operation',  pair: '00' },
    { q0: '0', qm1: '1', op: 'A = A + M',      pair: '01' },
    { q0: '1', qm1: '0', op: 'A = A \u2212 M', pair: '10' },
    { q0: '1', qm1: '1', op: 'No operation',  pair: '11' },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="mb-1 text-left font-mono text-[11px] uppercase tracking-widest text-slate-500">
          Booth decision table
        </caption>
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 font-mono text-xs">Q\u2080</th>
            <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 font-mono text-xs">Q\u208b\u2081</th>
            <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 font-mono text-xs">Operation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isActive = activePair === r.pair;
            return (
              <tr
                key={r.pair}
                className={isActive
                  ? 'bg-indigo-50 font-semibold'
                  : 'even:bg-slate-50'}
              >
                <td className={`border border-slate-200 px-3 py-2 font-mono text-xs ${isActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                  {r.q0}
                </td>
                <td className={`border border-slate-200 px-3 py-2 font-mono text-xs ${isActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                  {r.qm1}
                </td>
                <td className={`border border-slate-200 px-3 py-2 ${isActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                  {r.op}
                  {isActive && (
                    <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] text-indigo-600">
                      ← current
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BoothSim() {
  const [m, setM] = useState('-5');
  const [q, setQ] = useState('7');
  const [n, setN] = useState(4);
  const build = useMemo(() => buildBooth({ m, q, n }), [m, q, n]);

  return (
    <SimLayout<BoothState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="booth-m" label="Multiplicand M" hint="Signed decimal that fits the width.">
            <input
              id="booth-m"
              className={inputClass}
              value={m}
              onChange={(e) => setM(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="booth-q" label="Multiplier Q" hint="Signed decimal that fits the width.">
            <input
              id="booth-q"
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field id="booth-n" label="Register width n" hint="Two's complement bits, 2 to 8.">
            <input
              id="booth-n"
              type="number"
              min={2}
              max={8}
              className={inputClass}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            />
          </Field>
        </>
      }
      assumptions={[
        "Two's complement, fixed width n.",
        'A and M are widened to n+1 bits so that A ± M cannot overflow.',
        'The shift is arithmetic: the sign bit of A is copied into its left-most position.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            {/* Register state table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <caption className="mb-1 text-left font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Register state
                </caption>
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600 w-16">
                      Register
                    </th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600">
                      Value (binary)
                    </th>
                    <th className="border border-slate-200 px-3 py-2 text-left font-mono text-xs font-semibold text-slate-600 w-24">
                      Decimal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'M',   bits: s.M,    tone: 'neutral' as const },
                    { name: 'A',   bits: s.A,    tone: 'amber'   as const },
                    { name: 'Q',   bits: s.Q,    tone: 'cyan'    as const },
                    { name: 'Q\u208b\u2081', bits: s.Qm1, tone: 'cyan' as const },
                  ].map(({ name, bits, tone }) => (
                    <tr key={name} className="even:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-mono text-sm font-semibold text-slate-700">
                        {name}
                      </td>
                      <td className="border border-slate-200 px-3 py-2">
                        <BitRow label="" bits={bits} tone={tone} />
                      </td>
                      <td className="border border-slate-200 px-3 py-2 font-mono text-sm text-slate-600">
                        {fromBitsSigned(bits)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status chips */}
            <div className="grid gap-3 sm:grid-cols-3">
              <ValueChip label="Iteration" value={`${s.iteration} of ${s.n}`} />
              <ValueChip
                label="Pair Q\u2080Q\u208b\u2081"
                value={s.pair || '\u2014'}
                tone={s.pair ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Operation"
                value={s.operation}
                tone={s.operation.includes('+') ? 'cyan' : s.operation.includes('\u2212') || s.operation.includes('-') ? 'amber' : 'neutral'}
              />
            </div>

            {/* Decision table with active row */}
            <BoothDecisionTable activePair={s.pair || ''} />

            {/* Flowchart */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Algorithm flowchart
              </p>
              <Flowchart
                title="Booth algorithm flowchart"
                width={680}
                height={540}
                nodes={BOOTH_NODES}
                edges={BOOTH_EDGES}
                {...boothFlowState(step.title, s.pair, s.iteration, s.n)}
              />
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const p = s.product;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Product bits (2n)"
                value={p ?? 'Available after the final shift'}
                tone={p ? 'indigo' : 'neutral'}
              />
              <ValueChip
                label="Product (decimal)"
                value={p ? String(fromBitsSigned(p)) : '\u2014'}
                tone={p ? 'indigo' : 'neutral'}
              />
            </div>
            {p && (
              <p className="text-xs text-slate-500">
                Verification: {fromBitsSigned(s.M.slice(1))} × {fromBitsSigned(s.Q)} ={' '}
                <strong className="text-slate-700">{fromBitsSigned(p)}</strong>
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
