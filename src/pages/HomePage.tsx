import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, FlaskConical, Search } from 'lucide-react';
import { UNITS, type Topic } from '@/content/curriculum';
import { SIMULATORS } from '@/components/sim/simulators/registry';
import { routeHref } from '@/app/router';

const TOPIC_COUNT = UNITS.reduce((n, u) => n + u.topics.length, 0);
const TRACE = ['ADD R1, R2, R3', 'SUB R4, R5, R6', 'AND R7, R8, R9', 'OR R10, R1, R2'];
const STAGES = ['F', 'D', 'E', 'W'];

// Stage color classes (bright, restrained)
const STAGE_CLS: Record<string, string> = {
  F: 'bg-blue-50   border-blue-200   text-blue-700',
  D: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  E: 'bg-violet-50 border-violet-200 text-violet-700',
  W: 'bg-teal-50   border-teal-200   text-teal-700',
};

function PipelineTrace() {
  return (
    <div
      aria-hidden
      className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-500">
          4-stage pipeline · cycle trace
        </span>
        <div className="flex gap-1.5">
          {['bg-slate-200', 'bg-slate-200', 'bg-indigo-300'].map((cls, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${cls}`} />
          ))}
        </div>
      </div>

      {/* Pipeline grid */}
      <div className="overflow-x-auto p-4">
        <table className="border-separate border-spacing-1 font-mono text-xs w-full">
          <caption className="sr-only">Pipeline trace example</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left px-2 py-1 font-medium text-slate-500 w-36">
                Instruction
              </th>
              {Array.from({ length: 7 }, (_, c) => (
                <th key={c} scope="col" className="w-10 text-center font-medium text-slate-400 py-1">
                  C{c + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRACE.map((ins, r) => (
              <tr key={ins}>
                <td className="px-2 py-1 text-slate-600 truncate pr-3">{ins}</td>
                {Array.from({ length: 7 }, (_, c) => {
                  const stage = STAGES[c - r];
                  return (
                    <td
                      key={c}
                      className={`h-8 w-10 rounded border text-center align-middle font-mono text-xs ${
                        stage ? STAGE_CLS[stage] : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      {stage ?? ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 font-mono text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          k + n − 1 = 4 + 4 − 1 = 7 cycles
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-4 py-3">
        {Object.entries(STAGE_CLS).map(([s, cls]) => (
          <span key={s} className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-mono ${cls}`}>
            {s} &nbsp;
            <span className="text-slate-500 font-sans">
              {{ F: 'Fetch', D: 'Decode', E: 'Execute', W: 'Write' }[s]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const MODE_LABEL: Record<Topic['modes'][number], string> = {
  reference: 'Learn',
  visualize: 'Visualize',
  simulate: 'Simulate',
};

const MODE_COLOR: Record<Topic['modes'][number], string> = {
  reference: 'border-slate-200 text-slate-500 bg-slate-50',
  visualize: 'border-blue-200 text-blue-600 bg-blue-50',
  simulate: 'border-indigo-200 text-indigo-600 bg-indigo-50',
};

export function HomePage() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return UNITS.flatMap((u) => u.topics).filter((t) =>
      `${t.title} ${t.summary}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-10">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header className="grid items-start gap-8 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-8">
        <div className="step-enter flex flex-col gap-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-indigo-500 mb-2">
              21CSS201T · Computer Organization &amp; Architecture
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              COA Laboratory
            </h1>
            <p className="mt-1 text-xl font-normal text-slate-500 sm:text-2xl">
              Interactive visualizer &amp; simulation bench
            </p>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-slate-600">
            Work through number conversions, Booth multiplication, datapaths, pipelines and I/O —
            one state at a time. Every simulator is deterministic: step forward and back, inspect
            every register and control signal.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={routeHref('lab')}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 shadow-sm"
            >
              <FlaskConical size={16} aria-hidden />
              Open the lab
            </a>
            <a
              href={routeHref('viva')}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              Practise viva <ArrowRight size={16} aria-hidden />
            </a>
          </div>

          {/* Stats strip */}
          <dl className="mt-2 flex gap-8 border-t border-slate-200 pt-5">
            {[
              ['Units', UNITS.length],
              ['Topics', TOPIC_COUNT],
              ['Simulators', SIMULATORS.length],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="font-mono text-[11px] uppercase tracking-widest text-slate-400">{k}</dt>
                <dd className="mt-1 font-mono text-2xl tabular-nums font-bold text-indigo-600">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Pipeline demo card */}
        <PipelineTrace />
      </header>

      {/* ── Course map ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Course map</h2>
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search topics</span>
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics — Booth, Gray code, pipeline…"
              className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>
      </div>

      {matches ? (
        <section aria-label="Search results" className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            {matches.length} matching topic{matches.length !== 1 ? 's' : ''}
          </p>
          {matches.length === 0 && (
            <p className="text-sm text-slate-400">No topic matches that search.</p>
          )}
          <ul className="grid gap-3 md:grid-cols-2">
            {matches.map((t) => (
              <li key={t.id}>
                <TopicLink topic={t} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <ul className="-mt-6 grid gap-4 lg:grid-cols-2">
          {UNITS.map((u) => (
            <li
              key={u.id}
              className="group/unit flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">
                  Unit {u.id}
                </span>
                <span className="text-xs text-slate-400">
                  {u.topics.filter((t) => t.simulatorId).length} simulator{u.topics.filter((t) => t.simulatorId).length !== 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                <a
                  href={routeHref(`unit/${u.id}`)}
                  className="rounded hover:text-indigo-700 focus-visible:outline-none"
                >
                  {u.title}
                </a>
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {u.topics.length} topics · {u.sourceFile}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {u.topics.slice(0, 7).map((t) => (
                  <li key={t.id}>
                    <a
                      href={routeHref(`topic/${t.id}`)}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {t.title}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={routeHref(`unit/${u.id}`)}
                className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Open unit <ChevronRight size={14} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TopicLink({ topic }: { topic: Topic }) {
  return (
    <a
      href={routeHref(`topic/${topic.id}`)}
      className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:border-indigo-200"
    >
      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
        Unit {topic.unit}
      </span>
      <span className="text-sm font-semibold text-slate-900">{topic.title}</span>
      <span className="text-xs leading-relaxed text-slate-500">{topic.summary}</span>
      <span className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {topic.modes.map((m) => (
          <span
            key={m}
            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${MODE_COLOR[m]}`}
          >
            {MODE_LABEL[m]}
          </span>
        ))}
      </span>
    </a>
  );
}
