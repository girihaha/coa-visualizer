import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  FLYNN,
  buildArraySum,
  buildMulticore,
  type ArraySumState,
  type Flynn,
  type MulticoreState,
} from '@/sims/logic/parallel';

const LANE_TONES = [
  'border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold',
  'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold',
  'border-amber-300 bg-amber-50 text-amber-800 font-semibold',
  'border-blue-300 bg-blue-50 text-blue-800 font-semibold',
];

export function FlynnExplorer() {
  const [selected, setSelected] = useState<Flynn>('SIMD');
  const info = FLYNN.find((f) => f.id === selected)!;
  const iCount = info.instructionStreams === 'single' ? 1 : 3;
  const dCount = info.dataStreams === 'single' ? 1 : 3;
  const pCount = Math.max(iCount, dCount);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
      {/* 2x2 Matrix */}
      <section
        aria-label="Flynn taxonomy grid"
        className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Instruction streams × data streams
        </p>
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-center">
          <span />
          <span className="pb-1 font-mono text-[11px] uppercase text-slate-400 font-medium">
            Single data
          </span>
          <span className="pb-1 font-mono text-[11px] uppercase text-slate-400 font-medium">
            Multiple data
          </span>
          {(['single', 'multiple'] as const).map((is) => (
            <div key={is} className="contents">
              <span className="flex items-center pr-2 text-left font-mono text-[11px] uppercase text-slate-400 font-medium">
                {is === 'single' ? 'Single instr.' : 'Multiple instr.'}
              </span>
              {FLYNN.filter((f) => f.instructionStreams === is).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected === f.id}
                  onClick={() => setSelected(f.id)}
                  className={`rounded-lg border px-3 py-4 font-mono text-base font-bold transition-all ${
                    selected === f.id
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {f.id}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-sm font-bold text-slate-900">{info.name}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{info.description}</p>
          <p className="mt-2 font-mono text-xs text-indigo-700 font-medium">
            Example: {info.example}
          </p>
        </div>
      </section>

      {/* Stream Diagram */}
      <section
        aria-label={`${selected} stream diagram`}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Stream diagram ({selected})
        </p>
        <div key={selected} className="step-enter grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Instruction Streams ({iCount})
            </p>
            {Array.from({ length: iCount }, (_, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 font-mono text-xs text-amber-800 font-medium shadow-sm"
              >
                {iCount === 1 ? 'Control Unit · IS' : `CU ${i + 1} · IS${i + 1}`}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Processing Units ({pCount})
            </p>
            {Array.from({ length: pCount }, (_, i) => (
              <div
                key={i}
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 font-mono text-xs text-indigo-800 font-medium shadow-sm"
              >
                PU {i + 1}{' '}
                <span className="text-indigo-500">
                  ← IS{iCount === 1 ? '' : i + 1}, DS{dCount === 1 ? '' : i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Data Streams ({dCount})
            </p>
            {Array.from({ length: dCount }, (_, i) => (
              <div
                key={i}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 font-mono text-xs text-emerald-800 font-medium shadow-sm"
              >
                {dCount === 1 ? 'Memory · DS' : `Mem ${i + 1} · DS${i + 1}`}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
          {iCount === 1 && pCount > 1 && 'One single instruction stream is broadcast across all processing units concurrently. '}
          {dCount === 1 && pCount > 1 && 'Every processing unit operates over the same shared data stream. '}
          Labels show which stream connects to each functional unit.
        </p>
      </section>
    </div>
  );
}

export function ArraySumSim() {
  const [values, setValues] = useState('3 8 1 6 4 9 2 7');
  const [lanes, setLanes] = useState(4);
  const build = useMemo(() => buildArraySum({ values, lanes }), [values, lanes]);

  return (
    <SimLayout<ArraySumState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="as-values" label="Array elements" hint="2 to 16 whole numbers, separated by spaces.">
            <input
              id="as-values"
              className={inputClass}
              value={values}
              onChange={(e) => setValues(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="as-lanes" label="Parallel SIMD lanes">
            <Segmented
              label="Lanes"
              value={lanes}
              options={[1, 2, 3, 4].map((n) => ({ value: n, label: `${n} lane${n > 1 ? 's' : ''}` }))}
              onChange={setLanes}
            />
          </Field>
        </>
      }
      assumptions={[
        'Each parallel lane performs one addition per time step concurrently.',
        'Element i is assigned round-robin to lane (i mod lanes).',
        'Demonstrates data-level parallelism (DLP) across SIMD lanes.',
      ]}
      visual={(step) => {
        const s = step.state;
        return (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Array partition across lanes
              </p>
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Array elements">
                {s.values.map((v, i) => {
                  const lane = i % s.lanes;
                  const active =
                    s.cursor[lane] === i && s.activeLanes.includes(lane) && s.phase === 'lanes';
                  return (
                    <div
                      key={i}
                      role="listitem"
                      aria-label={`a[${i}] = ${v}, lane ${lane}`}
                      className={`flex w-12 flex-col items-center rounded-lg border py-2 transition-all ${
                        active
                          ? LANE_TONES[lane]
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-slate-400">a[{i}]</span>
                      <span className="font-mono text-sm tabular-nums font-semibold">{v}</span>
                      <span className="font-mono text-[9px] text-slate-400">L{lane}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Lane accumulators
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {s.partials.map((p, l) => (
                  <div
                    key={l}
                    className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 transition-colors ${
                      s.activeLanes.includes(l)
                        ? LANE_TONES[l]
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-500">
                      {s.phase === 'combine' || s.phase === 'done' ? `Partial sum ${l}` : `Lane ${l}`}
                    </span>
                    <span className="font-mono text-base font-bold tabular-nums">{p ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <ValueChip label="Time step" value={`Step ${s.timeStep}`} tone="indigo" />
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <ValueChip
            label="Total sum"
            value={step.state.total === null ? 'Computing…' : String(step.state.total)}
            tone={step.state.total === null ? 'neutral' : 'indigo'}
          />
          <ValueChip
            label="Parallel time steps"
            value={step.state.phase === 'done' ? String(step.state.timeStep) : '—'}
          />
          <ValueChip
            label="Equivalent sequential additions"
            value={String(step.state.values.length - 1)}
          />
        </div>
      )}
    />
  );
}

export function MulticoreSim() {
  const [threads, setThreads] = useState('3 2 4 2 3');
  const [cores, setCores] = useState(2);
  const [slice, setSlice] = useState(2);
  const build = useMemo(() => buildMulticore({ threads, cores, slice }), [threads, cores, slice]);

  return (
    <SimLayout<MulticoreState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field
            id="mc-threads"
            label="Thread runtimes"
            hint="Work units for T1, T2, ... (1 to 9 each, up to 8 threads)."
          >
            <input
              id="mc-threads"
              className={inputClass}
              value={threads}
              onChange={(e) => setThreads(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="mc-cores" label="Processor cores">
            <Segmented
              label="Cores"
              value={cores}
              options={[1, 2, 3, 4].map((n) => ({
                value: n,
                label: n === 1 ? '1 core' : `${n} cores`,
              }))}
              onChange={setCores}
            />
          </Field>
          <Field id="mc-slice" label="Time slice (quantum)">
            <Segmented
              label="Time slice"
              value={slice}
              options={[1, 2, 3, 4].map((n) => ({
                value: n,
                label: `${n} unit${n > 1 ? 's' : ''}`,
              }))}
              onChange={setSlice}
            />
          </Field>
        </>
      }
      assumptions={[
        'Each core runs one assigned thread per time unit.',
        'Threads are distributed statically round-robin to cores and do not migrate.',
        'Within each core, threads are scheduled using round-robin time slicing.',
      ]}
      visual={(step) => {
        const s = step.state;
        const maxT = Math.max(s.time, 1);
        return (
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Core execution schedule
              </p>
              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <table className="border-separate border-spacing-1 font-mono text-xs w-full">
                  <caption className="sr-only">Core timeline up to time {s.time}</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="px-2.5 py-1 text-left font-semibold text-slate-600 border-b border-slate-200">
                        Core
                      </th>
                      {Array.from({ length: maxT }, (_, t) => (
                        <th
                          key={t}
                          scope="col"
                          className={`w-9 text-center font-semibold border-b border-slate-200 ${
                            t + 1 === s.time ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        >
                          T{t + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.cores.map((c) => (
                      <tr key={c.core}>
                        <th
                          scope="row"
                          className="whitespace-nowrap px-2.5 py-1 text-left font-semibold text-slate-700 bg-white"
                        >
                          Core {c.core}
                        </th>
                        {Array.from({ length: maxT }, (_, t) => {
                          const entry = s.log.find((l) => l.time === t + 1 && l.core === c.core);
                          const n = entry ? Number(entry.thread.slice(1)) - 1 : -1;
                          return (
                            <td
                              key={t}
                              aria-label={entry ? entry.thread : 'idle'}
                              className={`h-9 w-9 rounded border text-center align-middle font-bold ${
                                entry
                                  ? LANE_TONES[n % 4]
                                  : 'border-slate-100 bg-slate-50 text-slate-300'
                              }`}
                            >
                              {entry ? entry.thread : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Thread queue &amp; remaining work
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(s.remaining).map(([t, r]) => (
                  <span
                    key={t}
                    className={`rounded-lg border px-3 py-1 font-mono text-xs ${
                      r === 0
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {t}: {r === 0 ? '✓ Completed' : `${r} units left`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }}
      output={(step) => {
        const s = step.state;
        const total = Object.keys(s.remaining).length;
        return (
          <div className="grid gap-3 sm:grid-cols-3">
            <ValueChip label="Elapsed time" value={`${s.time} units`} tone="indigo" />
            <ValueChip
              label="Threads completed"
              value={`${s.done.length} of ${total}`}
            />
            <ValueChip
              label="Active now"
              value={s.cores.map((c) => c.thread ?? 'idle').join(' / ')}
            />
          </div>
        );
      }}
    />
  );
}
