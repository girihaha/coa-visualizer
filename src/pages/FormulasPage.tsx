import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FORMULAS } from '@/content/formulas';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { routeHref } from '@/app/router';

export function FormulasPage() {
  const [query, setQuery] = useState('');
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULAS.filter(
      (f) => !q || `${f.name} ${f.expression} ${f.notes}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[{ label: 'Course map', href: '#/' }, { label: 'Algorithms and formulas' }]}
      />

      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Algorithms and formula reference</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Only formulas and rules that are either shown in the course files or needed by a named
          simulator. Entries are pending review against the source slides until a reviewer signs them
          off.
        </p>
        <label className="relative block max-w-md">
          <span className="sr-only">Search formulas</span>
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas…"
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((f) => (
          <li
            key={f.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] text-indigo-600">
                Unit {f.unit}
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">{f.name}</h2>
            <p className="break-words rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-indigo-700">
              {f.expression}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">{f.notes}</p>
            {f.simulatorId && (
              <a
                href={routeHref(`simulate/${f.simulatorId}`)}
                className="mt-auto w-fit text-sm font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500 transition-colors"
              >
                Open related simulator
              </a>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="col-span-2 text-sm text-slate-400">No formulas match that search.</li>
        )}
      </ul>
    </div>
  );
}
