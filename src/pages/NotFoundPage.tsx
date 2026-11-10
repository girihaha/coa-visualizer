import { Breadcrumbs } from '@/components/Breadcrumbs';

export function NotFoundPage() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs items={[{ label: 'Course map', href: '#/' }, { label: 'Not found' }]} />
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="text-sm text-slate-600">
        That address does not match a unit, topic or simulator.
      </p>
      <a
        href="#/"
        className="w-fit text-sm font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500 transition-colors"
      >
        Return to the course map
      </a>
    </div>
  );
}
