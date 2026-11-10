import { Suspense } from 'react';
import { findSimulator } from '@/components/sim/simulators/registry';
import { UNITS } from '@/content/curriculum';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { routeHref } from '@/app/router';

export function SimulatePage({ simulatorId }: { simulatorId: string }) {
  const entry = findSimulator(simulatorId);
  if (!entry) return <NotFoundPage />;
  const topic = UNITS.flatMap((u) => u.topics).find((t) => t.simulatorId === simulatorId);
  const Sim = entry.Component;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: 'Course map', href: '#/' },
          ...(topic ? [{ label: topic.title, href: routeHref(`topic/${topic.id}`) }] : []),
          { label: 'Simulator' },
        ]}
      />
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-indigo-500">Simulator</p>
        <h1 className="text-3xl font-bold text-slate-900">{entry.title}</h1>
        {topic && (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{topic.summary}</p>
        )}
      </header>
      <Suspense
        fallback={
          <p className="text-sm text-slate-400">Loading simulator…</p>
        }
      >
        <Sim />
      </Suspense>
    </div>
  );
}
