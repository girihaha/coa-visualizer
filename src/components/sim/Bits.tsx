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
    neutral: 'bg-white border-slate-200',
    amber:   'bg-amber-50 border-amber-200',
    cyan:    'bg-blue-50 border-blue-200',
    red:     'bg-red-50 border-red-200',
    indigo:  'bg-indigo-50 border-indigo-200',
  }[tone];

  return (
    <div className={`min-w-0 rounded border px-3 py-2 ${bgClass}`}>
      <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 break-all font-mono text-sm font-medium ${toneClass}`}>{value}</p>
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
  'w-full rounded border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors';

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
            className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              active
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
