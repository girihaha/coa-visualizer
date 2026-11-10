import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} aria-hidden className="text-slate-300" />}
            {c.href ? (
              <a href={c.href} className="rounded hover:text-indigo-600 transition-colors">
                {c.label}
              </a>
            ) : (
              <span aria-current="page" className="text-slate-700 font-medium">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
