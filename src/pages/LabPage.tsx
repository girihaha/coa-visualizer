import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { UNITS } from '@/content/curriculum';
import { SIMULATORS } from '@/components/sim/simulators/registry';
import { routeHref } from '@/app/router';

const LAB = UNITS.map((u) => {
  const ids = [...new Set(u.topics.map((t) => t.simulatorId).filter((id): id is string => Boolean(id)))];
  return {
    unit: u,
    sims: ids.flatMap((id) => {
      const sim = SIMULATORS.find((s) => s.id === id);
      return sim
        ? [{ ...sim, topics: u.topics.filter((t) => t.simulatorId === id).map((t) => t.title) }]
        : [];
    }),
  };
});

export function LabPage() {
  let counter = 0;
  return (
    <div className="flex flex-col gap-10">

      {/* Header */}
      <header className="flex max-w-3xl flex-col gap-3 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-600">
            <FlaskConical size={18} aria-hidden />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-600">The Lab</span>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {SIMULATORS.length} simulators · one step at a time
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Every simulator is deterministic: enter your own values, then step forward and back through
          each intermediate state, with the reason for every change written out beside the registers.
        </p>
      </header>

      {/* Simulator list by unit */}
      {LAB.map(({ unit, sims }) => (
        <section key={unit.id} aria-labelledby={`lab-u${unit.id}`} className="flex flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">
              U{unit.id}
            </span>
            <h2 id={`lab-u${unit.id}`} className="text-lg font-bold text-slate-900">
              {unit.title}
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sims.map((s) => {
              counter += 1;
              return (
                <li key={s.id}>
                  <a
                    href={routeHref(`simulate/${s.id}`)}
                    className="group flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-mono text-xs tabular-nums text-slate-400">
                        {String(counter).padStart(2, '0')}
                      </span>
                      <ArrowUpRight
                        size={16}
                        aria-hidden
                        className="text-slate-300 transition-colors group-hover:text-indigo-500"
                      />
                    </span>
                    <span className="text-base font-semibold text-slate-900">{s.title}</span>
                    <span className="mt-auto text-xs leading-relaxed text-slate-500">
                      {s.topics.join(' · ')}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
