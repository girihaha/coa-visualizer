import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Eye,
  EyeOff,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { VIVA_CARDS } from '@/content/viva';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useVivaProgress } from '@/lib/useVivaProgress';

type Filter = 'all' | 1 | 2 | 3 | 4 | 5 | 'review';

export function VivaPage() {
  const { progress, sync, mark, reset } = useVivaProgress();
  const [filter, setFilter] = useState<Filter>('all');
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const loaded = sync !== 'loading';
  const cards = useMemo(
    () =>
      VIVA_CARDS.filter((c) =>
        filter === 'all'
          ? true
          : filter === 'review'
          ? progress[c.id] !== 'known'
          : c.unit === filter,
      ),
    // The review deck is snapshotted when the filter changes so rated cards don't vanish mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, loaded],
  );
  const safeIndex = Math.min(index, Math.max(cards.length - 1, 0));
  const card = cards[safeIndex];
  const known = VIVA_CARDS.filter((c) => progress[c.id] === 'known').length;
  const pct = Math.round((known / VIVA_CARDS.length) * 100);

  const go = (next: number) => {
    setIndex(next);
    setRevealed(false);
  };

  useEffect(() => {
    const move = (next: number) => {
      setIndex(next);
      setRevealed(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)
      )
        return;
      if (e.key === 'ArrowRight') move(Math.min(cards.length - 1, safeIndex + 1));
      else if (e.key === 'ArrowLeft') move(Math.max(0, safeIndex - 1));
      else if (e.key === ' ') {
        e.preventDefault();
        setRevealed((r) => !r);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cards.length, safeIndex]);

  const rate = (status: 'known' | 'review') => {
    if (!card) return;
    void mark(card.id, status);
    if (safeIndex < cards.length - 1) go(safeIndex + 1);
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...([1, 2, 3, 4, 5] as const).map((u) => ({ value: u, label: `Unit ${u}` })),
    { value: 'review', label: 'Needs review' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: 'Course map', href: '#/' }, { label: 'Viva' }]} />

      {/* Header + progress */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-slate-200 pb-6">
        <div className="flex max-w-2xl flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-500">
            Viva practice
          </p>
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Answer out loud, then check
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Say your answer before revealing it, then mark whether you knew it. Progress is saved on
            this device. Keys: Space reveals, arrows move.
          </p>
        </div>
        <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-sm shrink-0">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
              Known
            </span>
            <span className="font-mono text-sm tabular-nums font-semibold text-slate-900">
              {known} / {VIVA_CARDS.length}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Cards known"
          >
            <div
              className="h-full rounded-full bg-green-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            {sync === 'error' ? (
              <span className="inline-flex items-center gap-1.5 text-red-600">
                <CloudOff size={13} aria-hidden /> Could not save progress
              </span>
            ) : (
              <span className="text-slate-400">
                {sync === 'loading' ? 'Loading progress…' : 'Saved'}
              </span>
            )}
            {confirmReset ? (
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void reset();
                    setConfirmReset(false);
                  }}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Confirm reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                disabled={known === 0 && Object.keys(progress).length === 0}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 disabled:opacity-40"
              >
                <RotateCcw size={12} aria-hidden /> Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filter selector */}
      <div role="radiogroup" aria-label="Filter cards" className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={String(f.value)}
            type="button"
            role="radio"
            aria-checked={filter === f.value}
            onClick={() => {
              setFilter(f.value);
              go(0);
            }}
            className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
              filter === f.value
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {card ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* Card */}
          <article
            key={card.id}
            aria-labelledby="viva-question"
            className="step-enter flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-500">
              <span>
                Card {safeIndex + 1} of {cards.length}
              </span>
              <span className="text-slate-300">/</span>
              <span>
                Unit {card.unit} · {card.topic}
              </span>
              {progress[card.id] && (
                <span
                  className={`rounded border px-1.5 py-0.5 normal-case tracking-normal text-[11px] ${
                    progress[card.id] === 'known'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {progress[card.id] === 'known' ? '✓ Known' : '↺ Reviewing'}
                </span>
              )}
            </p>

            <h2
              id="viva-question"
              className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl"
            >
              {card.question}
            </h2>

            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              aria-expanded={revealed}
              className="inline-flex w-fit items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {revealed ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              {revealed ? 'Hide answer' : 'Reveal answer'}
            </button>

            {revealed && (
              <div className="step-enter flex flex-col gap-5 border-t border-slate-100 pt-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-indigo-500">
                    Answer
                  </p>
                  <p className="mt-2 text-base text-slate-900">{card.answer}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    Why it is correct
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{card.why}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    What the visual shows
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{card.visual}</p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => rate('known')}
                    className="inline-flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                  >
                    <Check size={16} aria-hidden /> I knew it
                  </button>
                  <button
                    type="button"
                    onClick={() => rate('review')}
                    className="inline-flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    <RotateCw size={16} aria-hidden /> Review again
                  </button>
                </div>
              </div>
            )}
          </article>

          {/* Card grid sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(Math.max(0, safeIndex - 1))}
                disabled={safeIndex === 0}
                aria-label="Previous card"
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(Math.min(cards.length - 1, safeIndex + 1))}
                disabled={safeIndex >= cards.length - 1}
                aria-label="Next card"
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <ol className="grid grid-cols-6 gap-1" aria-label="Cards in this deck">
              {cards.map((c, i) => {
                const s = progress[c.id];
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Card ${i + 1}${s ? `, ${s}` : ''}`}
                      aria-current={i === safeIndex ? 'true' : undefined}
                      className={`flex h-8 w-full items-center justify-center rounded border font-mono text-[11px] transition-colors ${
                        i === safeIndex
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                          : s === 'known'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : s === 'review'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-medium text-slate-900">
            {filter === 'review' ? 'Nothing left to review.' : 'No cards in this deck.'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {filter === 'review'
              ? 'Every card is marked as known. Pick another deck or reset your progress.'
              : 'Try another filter.'}
          </p>
        </div>
      )}
    </div>
  );
}
