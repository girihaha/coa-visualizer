import { UNITS } from '@/content/curriculum';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const LIMITATIONS = [
  'Several PDF pages and slides are diagram-led or have little extractable text, especially Unit 2 pages 20 to 31, Unit 5 pages 32 to 64, and several Unit III figures.',
  'The 8086 assembly listing is not reliably readable from the slides; the example is marked to transcribe rather than reproduced.',
  'ARM details that appear only in images are not inferred from surrounding blank text.',
  'IEEE 754 special values are listed only where a visual review confirms them.',
  'Unit 4 control-signal equations are not reconstructed; only complete, legible equations would be shown.',
  'Simulators are bounded teaching models, not general CPU or ISA emulators, and make no performance claims.',
];

export function SourcesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[{ label: 'Course map', href: '#/' }, { label: 'Sources and limitations' }]}
      />

      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Sources and limitations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          The curriculum is taken from these five supplied files for 21CSS201T. Content not supported
          by them is not included.
        </p>
      </header>

      <section aria-labelledby="src-files" className="flex flex-col gap-3">
        <h2 id="src-files" className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Supplied files
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {UNITS.map((u) => (
            <li key={u.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-600">
                Unit {u.id}
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{u.sourceFile}</p>
              <p className="mt-1 text-xs text-slate-500">
                {u.pages} · {u.topics.length} topics in the inventory ·{' '}
                {u.topics.filter((t) => t.sourcePending).length} marked source detail to verify
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="src-limits" className="flex flex-col gap-3">
        <h2 id="src-limits" className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Known limitations
        </h2>
        <ul className="flex flex-col gap-2.5">
          {LIMITATIONS.map((l) => (
            <li key={l} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300"
              />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
