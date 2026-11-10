import type { ReactNode } from 'react';

export function BitRow({
  label,
  bits,
  highlight = [],
  tone = 'neutral',
  caption,
}: {
  label: string;
  bits: string;
  highlight?: number[];
  tone?: 'neutral' | 'amber' | 'cyan' | 'red' | 'indigo';
  caption?: ReactNode;
}) {
  const hl = new Set(highlight);

  // Bright-mode cell palettes
  const idleCls = 'border-slate-200 bg-slate-50 text-slate-700';
  const hlCls = {
    neutral: 'border-slate-400 bg-slate-100 text-slate-900',
    amber:   'border-amber-400 bg-amber-50 text-amber-800',
    cyan:    'border-blue-400 bg-blue-50 text-blue-800',
    red:     'border-red-400 bg-red-50 text-red-800',
    indigo:  'border-indigo-400 bg-indigo-50 text-indigo-800',
  }[tone];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-sm font-semibold text-slate-700">{label}</span>
        <span className="font-mono text-xs text-slate-400">
          {bits.length} bits{caption ? ` · ${caption}` : ''}
        </span>
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1" role="group" aria-label={`${label} = ${bits}`}>
        <div className="flex w-max gap-0.5">
          {bits.split('').map((b, i) => (
            <span
              key={i}
              aria-hidden
              className={`flex h-9 w-7 items-center justify-center rounded border font-mono text-sm transition-colors duration-200 ${
                hl.has(i) ? `${hlCls} cell-flash` : idleCls
              } ${i > 0 && i % 4 === 0 ? 'ml-1' : ''}`}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
      <span className="sr-only">{`${label} equals ${bits}`}</span>
    </div>
  );
}

export function ValueChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'amber' | 'cyan' | 'red' | 'indigo';
}) {
  const toneClass = {
    neutral: 'text-slate-800',
    amber:   'text-amber-700',
    cyan:    'text-blue-700',
    red:     'text-red-700',
    indigo:  'text-indigo-700',
  }[tone];

  const bgClass = {
    neutral: 'bg-white border-slate-200/90 shadow-xs',
    amber:   'bg-amber-50/70 border-amber-200 shadow-xs',
    cyan:    'bg-blue-50/70 border-blue-200 shadow-xs',
    red:     'bg-red-50/70 border-red-200 shadow-xs',
    indigo:  'bg-indigo-50/70 border-indigo-200 shadow-xs',
  }[tone];

  return (
    <div className={`min-w-0 rounded-lg border px-3.5 py-2.5 ${bgClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-sans">{label}</p>
      <p className={`mt-1 break-all font-mono text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-slate-400">{hint}</p>}
      {error && <p className="text-xs leading-relaxed text-red-600">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs';

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              active
                ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-semibold shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
