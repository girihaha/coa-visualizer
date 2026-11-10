import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, FlaskConical, TriangleAlert } from 'lucide-react';
import { UNITS, findTopic, findUnit } from '@/content/curriculum';
import { findNote } from '@/content/notes';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { findSimulator } from '@/components/sim/simulators/registry';
import { routeHref } from '@/app/router';

const ALL_TOPICS = UNITS.flatMap((u) => u.topics);

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24 border-t border-slate-200 pt-6">
      <h2
        id={id}
        className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-indigo-500"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TopicPage({ topicId }: { topicId: string }) {
  const topic = findTopic(topicId);
  const unit = topic ? findUnit(topic.unit) : undefined;
  if (!topic || !unit) return <NotFoundPage />;
  const sim = topic.simulatorId ? findSimulator(topic.simulatorId) : undefined;
  const note = findNote(topic.id);
  const index = ALL_TOPICS.findIndex((t) => t.id === topic.id);
  const prev = ALL_TOPICS[index - 1];
  const next = ALL_TOPICS[index + 1];

  const sections = [
    note && { id: 'definition', title: 'Definition' },
    note?.purpose && { id: 'purpose', title: 'Purpose' },
    note?.working && { id: 'working', title: 'Working' },
    note?.algorithm && { id: 'algorithm', title: 'Algorithm' },
    note?.formula && { id: 'formula', title: 'Formula' },
    note?.example && { id: 'example', title: 'Example' },
    note && { id: 'key-points', title: 'Key points' },
    { id: 'provenance', title: 'Provenance' },
  ].filter(Boolean) as { id: string; title: string }[];

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: 'Course map', href: '#/' },
          { label: `Unit ${unit.id}`, href: routeHref(`unit/${unit.id}`) },
          { label: topic.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* ── Main article ─────────────────────────────────────────── */}
        <article className="flex max-w-3xl flex-col gap-6">
          <header className="step-enter flex flex-col gap-3 border-b border-slate-200 pb-6">
            <p className="font-mono text-xs text-slate-500">
              Unit {unit.id} · Topic {index + 1} of {ALL_TOPICS.length}
            </p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {topic.title}
            </h1>
            <p className="text-base leading-relaxed text-slate-600">{topic.summary}</p>
          </header>

          {/* Source-pending warning */}
          {topic.sourcePending && (
            <div
              role="note"
              className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800"
            >
              <TriangleAlert size={18} aria-hidden className="mt-0.5 shrink-0 text-amber-500" />
              <p>
                Source detail pending verification. Parts of this topic come from diagrams or slides
                whose text could not be fully extracted. The notes below use standard course
                definitions; check figures and exact wording against the slides.
              </p>
            </div>
          )}

          {note && (
            <>
              <Section id="definition" title="Definition">
                <p className="text-base leading-relaxed text-slate-700">{note.definition}</p>
              </Section>

              {note.purpose && (
                <Section id="purpose" title="Purpose">
                  <p className="leading-relaxed text-slate-600">{note.purpose}</p>
                </Section>
              )}

              {note.working && (
                <Section id="working" title="Working">
                  <p className="leading-relaxed text-slate-600">{note.working}</p>
                </Section>
              )}

              {note.algorithm && (
                <Section id="algorithm" title="Algorithm">
                  <ol className="flex flex-col gap-2.5">
                    {note.algorithm.map((s, i) => (
                      <li key={i} className="flex gap-3 leading-relaxed text-slate-700">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-indigo-200 bg-indigo-50 font-mono text-xs font-semibold text-indigo-600">
                          {i + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {note.formula && (
                <Section id="formula" title="Formula">
                  <dl className="flex flex-col gap-3">
                    {note.formula.map((f) => (
                      <div
                        key={f.expression}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <dt className="font-mono text-sm font-semibold text-indigo-700">
                          {f.expression}
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {f.meaning}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}

              {note.example && (
                <Section id="example" title="Example">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
                      {note.example.label}
                    </p>
                    <p className="mt-2 font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {note.example.body}
                    </p>
                  </div>
                </Section>
              )}

              <Section id="key-points" title="Key points">
                <ul className="flex flex-col gap-2.5">
                  {note.keyPoints.map((k) => (
                    <li key={k} className="flex gap-3 leading-relaxed text-slate-700">
                      <span
                        aria-hidden
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"
                      />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}

          <Section id="provenance" title="Provenance">
            <p className="text-sm leading-relaxed text-slate-500">
              {unit.sourceFile} ({unit.pages}), Unit {unit.id} topic inventory. Page and slide
              locators are recorded on the{' '}
              <a
                className="text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500 transition-colors"
                href={routeHref('sources')}
              >
                Sources and limitations
              </a>{' '}
              page.
            </p>
          </Section>

          {/* Prev / Next nav */}
          <nav
            aria-label="Topic navigation"
            className="mt-4 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2"
          >
            {prev ? (
              <a
                href={routeHref(`topic/${prev.id}`)}
                className="group flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                  <ArrowLeft
                    size={12}
                    aria-hidden
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  Previous
                </span>
                <span className="text-sm text-slate-700">{prev.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a
                href={routeHref(`topic/${next.id}`)}
                className="group flex flex-col items-end gap-1 rounded-lg border border-slate-200 bg-white p-4 text-right shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                  Next{' '}
                  <ArrowRight
                    size={12}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-sm text-slate-700">{next.title}</span>
              </a>
            )}
          </nav>
        </article>

        {/* ── Right sidebar ─────────────────────────────────────────── */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          {/* Simulator CTA */}
          {sim && topic.simulatorId && (
            <a
              href={routeHref(`simulate/${topic.simulatorId}`)}
              className="group flex flex-col gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-5 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-indigo-300 bg-white text-indigo-600 shadow-sm">
                <FlaskConical size={18} aria-hidden />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-indigo-500">
                Open in the lab
              </span>
              <span className="text-sm font-semibold text-slate-900">{sim.title}</span>
              {note?.visualization && (
                <span className="text-xs leading-relaxed text-slate-600">{note.visualization}</span>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700">
                Start simulating{' '}
                <ArrowRight
                  size={14}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </a>
          )}

          {/* On-this-page nav */}
          <nav aria-label="On this page" className="hidden flex-col gap-0.5 lg:flex">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
              On this page
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-l-2 border-slate-200 py-1 pl-3 text-sm text-slate-500 transition-colors hover:border-indigo-400 hover:text-slate-800"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
