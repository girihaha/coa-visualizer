import { Cpu } from 'lucide-react';
import { useHashRoute, routeHref, type Route } from '@/app/router';
import { HomePage } from '@/pages/HomePage';
import { UnitPage } from '@/pages/UnitPage';
import { TopicPage } from '@/pages/TopicPage';
import { SimulatePage } from '@/pages/SimulatePage';
import { FormulasPage } from '@/pages/FormulasPage';
import { VivaPage } from '@/pages/VivaPage';
import { SourcesPage } from '@/pages/SourcesPage';
import { LabPage } from '@/pages/LabPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const NAV: { label: string; href: string; match: Route['name'][] }[] = [
  { label: 'Course map', href: routeHref(''), match: ['home', 'unit', 'topic'] },
  { label: 'Lab', href: routeHref('lab'), match: ['lab', 'simulate'] },
  { label: 'Formulas', href: routeHref('formulas'), match: ['formulas'] },
  { label: 'Viva', href: routeHref('viva'), match: ['viva'] },
  { label: 'Sources', href: routeHref('sources'), match: ['sources'] },
];

function App() {
  const route = useHashRoute();

  let page;
  switch (route.name) {
    case 'home':
      page = <HomePage />;
      break;
    case 'unit':
      page = <UnitPage unitId={route.unitId} />;
      break;
    case 'topic':
      page = <TopicPage topicId={route.topicId} />;
      break;
    case 'simulate':
      page = <SimulatePage simulatorId={route.simulatorId} />;
      break;
    case 'lab':
      page = <LabPage />;
      break;
    case 'formulas':
      page = <FormulasPage />;
      break;
    case 'viva':
      page = <VivaPage />;
      break;
    case 'sources':
      page = <SourcesPage />;
      break;
    default:
      page = <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* ── Top navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <a href={routeHref('')} className="group flex items-center gap-2.5 rounded">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-indigo-200 bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
              <Cpu size={17} aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-slate-900">COA Lab</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">21CSS201T</span>
            </span>
          </a>

          <nav aria-label="Primary" className="-mx-1 flex gap-0.5 overflow-x-auto">
            {NAV.map((n) => {
              const active = n.match.includes(route.name);
              return (
                <a
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative whitespace-nowrap rounded px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'text-indigo-700 font-medium'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {n.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-indigo-500"
                    />
                  )}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {page}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs leading-relaxed text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Curriculum from the supplied 21CSS201T course files. Simulators are bounded,
            deterministic teaching models.
          </p>
          <a
            className="text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500 transition-colors"
            href={routeHref('sources')}
          >
            Sources and limitations
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
