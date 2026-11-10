import { FlaskConical } from 'lucide-react';
import { findUnit } from '@/content/curriculum';
import { TopicLink } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function UnitPage({ unitId }: { unitId: number }) {
  const unit = findUnit(unitId);
  if (!unit) return <NotFoundPage />;
  const simulated = unit.topics.filter(
    (t, i, all) => t.simulatorId && all.findIndex((o) => o.simulatorId === t.simulatorId) === i,
  );

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Course map', href: '#/' }, { label: `Unit ${unit.id}` }]} />

      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-600">
            Unit {unit.id}
          </span>
          <span className="font-mono text-xs text-slate-400">{unit.sourceFile} · {unit.pages}</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{unit.title}</h1>
      </header>

      {simulated.length > 0 && (
        <section aria-labelledby="unit-sims" className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FlaskConical size={14} aria-hidden className="text-indigo-500" />
            <h2 id="unit-sims" className="font-mono text-xs uppercase tracking-widest text-slate-500">
              Simulators in this unit
            </h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {simulated.map((t) => (
              <li key={t.id}>
                <a
                  href={`#/simulate/${t.simulatorId}`}
                  className="inline-flex rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
                >
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="unit-topics" className="flex flex-col gap-3">
        <h2 id="unit-topics" className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Topics ({unit.topics.length})
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {unit.topics.map((t) => (
            <li key={t.id}>
              <TopicLink topic={t} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
