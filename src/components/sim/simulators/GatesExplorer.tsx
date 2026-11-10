import { useState } from 'react';
import { Segmented } from '@/components/sim/Bits';
import {
  GATES,
  deMorgan,
  evalGate,
  fullAdder,
  halfAdder,
  truthTable,
  type GateName,
} from '@/sims/logic/gates';

type Bit = 0 | 1;
type View = 'gates' | 'adders' | 'demorgan';

function BitToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Bit;
  onChange: (v: Bit) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value ? 0 : 1)}
      aria-pressed={value === 1}
      aria-label={`Input ${label}, currently ${value}. Press to toggle.`}
      className={`group flex flex-col items-center gap-1 rounded-lg border px-4 py-3 transition-all ${
        value
          ? 'border-indigo-400 bg-indigo-50 shadow-sm ring-1 ring-indigo-200'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="font-mono text-xs font-semibold text-slate-500">{label}</span>
      <span
        className={`font-mono text-2xl font-bold tabular-nums ${
          value ? 'text-indigo-700' : 'text-slate-400'
        }`}
      >
        {value}
      </span>
      <span
        className={`font-mono text-[10px] uppercase font-semibold ${
          value ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        {value ? 'HIGH (1)' : 'LOW (0)'}
      </span>
    </button>
  );
}

function Output({ label, value }: { label: string; value: Bit }) {
  return (
    <div
      role="status"
      aria-label={`${label} equals ${value}`}
      className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-3 transition-colors ${
        value
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}
    >
      <span className="font-mono text-xs font-semibold text-slate-500">{label}</span>
      <span
        className={`font-mono text-2xl font-bold tabular-nums ${
          value ? 'text-emerald-700' : 'text-slate-400'
        }`}
      >
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase font-semibold">
        {value ? 'HIGH (1)' : 'LOW (0)'}
      </span>
    </div>
  );
}

function Table({
  headers,
  rows,
  current,
}: {
  headers: string[];
  rows: number[][];
  current: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            {headers.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-3.5 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-600 border-r border-slate-200 last:border-r-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isActive = i === current;
            return (
              <tr
                key={i}
                aria-current={isActive ? 'true' : undefined}
                className={`transition-colors border-b border-slate-100 last:border-b-0 ${
                  isActive
                    ? 'bg-indigo-50 font-bold text-indigo-900'
                    : 'even:bg-slate-50 text-slate-700'
                }`}
              >
                {r.map((v, j) => (
                  <td
                    key={j}
                    className={`px-3.5 py-2 tabular-nums border-r border-slate-100 last:border-r-0 ${
                      isActive && j === 0 ? 'relative' : ''
                    }`}
                  >
                    {v}
                    {isActive && j === 0 && (
                      <span className="ml-2 font-sans text-[10px] text-indigo-600 font-normal">
                        ← current
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function GatesExplorer() {
  const [view, setView] = useState<View>('gates');
  const [gate, setGate] = useState<GateName>('NAND');
  const [a, setA] = useState<Bit>(1);
  const [b, setB] = useState<Bit>(0);
  const [cin, setCin] = useState<Bit>(1);
  const info = GATES.find((g) => g.name === gate)!;

  return (
    <div className="flex flex-col gap-6">
      <Segmented<View>
        label="Explorer view"
        value={view}
        onChange={setView}
        options={[
          { value: 'gates',    label: 'Logic gates' },
          { value: 'adders',   label: 'Half and full adder' },
          { value: 'demorgan', label: "De Morgan's laws" },
        ]}
      />

      {/* ── Logic Gates ───────────────────────────────────────────── */}
      {view === 'gates' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section
            aria-label="Gate inputs and output"
            className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Gate picker */}
            <div
              role="radiogroup"
              aria-label="Gate"
              className="grid grid-cols-4 gap-1.5 sm:grid-cols-7"
            >
              {GATES.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  role="radio"
                  aria-checked={gate === g.name}
                  onClick={() => setGate(g.name)}
                  className={`rounded border px-2 py-2 font-mono text-xs transition-colors ${
                    gate === g.name
                      ? 'border-indigo-400 bg-indigo-50 font-bold text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Circuit representation */}
            <div className="flex items-center justify-center gap-4 py-4 sm:gap-6 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex flex-col gap-3">
                <BitToggle label="A" value={a} onChange={setA} />
                {info.inputs === 2 && <BitToggle label="B" value={b} onChange={setB} />}
              </div>
              <svg viewBox="0 0 120 80" className="h-20 w-28 shrink-0 sm:h-24 sm:w-36" aria-hidden>
                <path d="M0 25 H30 M0 55 H30 M90 40 H120" stroke="#94a3b8" strokeWidth="2" />
                <rect
                  x="30"
                  y="10"
                  width="60"
                  height="60"
                  rx="8"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                />
                <text
                  x="60"
                  y="45"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="13"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {gate}
                </text>
              </svg>
              <Output label="Y (Out)" value={evalGate(gate, a, b)} />
            </div>

            {/* Boolean expression */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-mono text-sm font-bold text-indigo-700">{info.expression}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{info.note}</p>
            </div>
          </section>

          {/* Truth table */}
          <section
            aria-label={`${gate} truth table`}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500">
              Truth table ({gate})
            </h3>
            <Table
              headers={info.inputs === 2 ? ['A', 'B', 'Y'] : ['A', 'Y']}
              rows={truthTable(gate).map((r) =>
                info.inputs === 2 ? [r.a, r.b, r.y] : [r.a, r.y],
              )}
              current={info.inputs === 2 ? a * 2 + b : a}
            />
          </section>
        </div>
      )}

      {/* ── Adders ─────────────────────────────────────────────────── */}
      {view === 'adders' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Half Adder */}
          <section
            aria-label="Half adder"
            className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <header className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Half Adder</h3>
              <p className="mt-1 font-mono text-xs font-semibold text-indigo-700">
                Sum = A ⊕ B · Carry = A · B
              </p>
            </header>
            <div className="flex flex-wrap items-center gap-3">
              <BitToggle label="A" value={a} onChange={setA} />
              <BitToggle label="B" value={b} onChange={setB} />
              <span aria-hidden className="px-1 font-mono text-slate-400 text-lg">
                →
              </span>
              <Output label="Sum" value={halfAdder(a, b).sum} />
              <Output label="Carry" value={halfAdder(a, b).carry} />
            </div>
            <Table
              headers={['A', 'B', 'Sum', 'Carry']}
              rows={[0, 1].flatMap((x) =>
                [0, 1].map((y) => {
                  const r = halfAdder(x as Bit, y as Bit);
                  return [x, y, r.sum, r.carry];
                }),
              )}
              current={a * 2 + b}
            />
          </section>

          {/* Full Adder */}
          <section
            aria-label="Full adder"
            className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <header className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Full Adder</h3>
              <p className="mt-1 font-mono text-xs font-semibold text-indigo-700">
                Sum = A ⊕ B ⊕ Cin · Cout = AB + Cin(A ⊕ B)
              </p>
            </header>
            <div className="flex flex-wrap items-center gap-3">
              <BitToggle label="A" value={a} onChange={setA} />
              <BitToggle label="B" value={b} onChange={setB} />
              <BitToggle label="Cin" value={cin} onChange={setCin} />
              <span aria-hidden className="px-1 font-mono text-slate-400 text-lg">
                →
              </span>
              <Output label="Sum" value={fullAdder(a, b, cin).sum} />
              <Output label="Cout" value={fullAdder(a, b, cin).carry} />
            </div>
            <Table
              headers={['A', 'B', 'Cin', 'Sum', 'Cout']}
              rows={[0, 1].flatMap((x) =>
                [0, 1].flatMap((y) =>
                  [0, 1].map((z) => {
                    const r = fullAdder(x as Bit, y as Bit, z as Bit);
                    return [x, y, z, r.sum, r.carry];
                  }),
                ),
              )}
              current={a * 4 + b * 2 + cin}
            />
            <p className="text-xs leading-relaxed text-slate-500">
              The full adder handles carry-in in addition to the two operand bits, enabling ripple-carry
              cascading across n bits.
            </p>
          </section>
        </div>
      )}

      {/* ── De Morgan's Laws ───────────────────────────────────────── */}
      {view === 'demorgan' && (
        <section
          aria-label="De Morgan's laws"
          className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <BitToggle label="A" value={a} onChange={setA} />
            <BitToggle label="B" value={b} onChange={setB} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: 'First Law (NAND theorem)',
                eq: "(A · B)' = A' + B'",
                left: deMorgan(a, b).law1Left,
                right: deMorgan(a, b).law1Right,
              },
              {
                title: 'Second Law (NOR theorem)',
                eq: "(A + B)' = A' · B'",
                left: deMorgan(a, b).law2Left,
                right: deMorgan(a, b).law2Right,
              },
            ].map((law) => (
              <div key={law.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  {law.title}
                </p>
                <p className="mt-2 font-mono text-base font-bold text-indigo-700">{law.eq}</p>
                <div className="mt-3 flex items-center gap-3 font-mono text-sm">
                  <span className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700">
                    LHS = {law.left}
                  </span>
                  <span className="text-slate-400">=</span>
                  <span className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700">
                    RHS = {law.right}
                  </span>
                  <span
                    className={`ml-auto text-xs font-semibold ${
                      law.left === law.right ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {law.left === law.right ? '✓ Identity holds' : 'Mismatch'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Table
            headers={['A', 'B', "(A·B)'", "A'+B'", "(A+B)'", "A'·B'"]}
            rows={[0, 1].flatMap((x) =>
              [0, 1].map((y) => {
                const d = deMorgan(x as Bit, y as Bit);
                return [x, y, d.law1Left, d.law1Right, d.law2Left, d.law2Right];
              }),
            )}
            current={a * 2 + b}
          />
        </section>
      )}
    </div>
  );
}
