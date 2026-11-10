import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'unit'; unitId: number }
  | { name: 'topic'; topicId: string }
  | { name: 'simulate'; simulatorId: string }
  | { name: 'lab' }
  | { name: 'formulas' }
  | { name: 'viva' }
  | { name: 'sources' }
  | { name: 'notFound' };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  const [head, ...rest] = path.split('/');
  const arg = rest.join('/');
  switch (head) {
    case '':
      return { name: 'home' };
    case 'unit': {
      const unitId = Number(arg);
      return Number.isInteger(unitId) && unitId >= 1 && unitId <= 5 ? { name: 'unit', unitId } : { name: 'notFound' };
    }
    case 'topic':
      return arg ? { name: 'topic', topicId: arg } : { name: 'notFound' };
    case 'simulate':
      return arg ? { name: 'simulate', simulatorId: arg } : { name: 'notFound' };
    case 'lab':
      return { name: 'lab' };
    case 'formulas':
      return { name: 'formulas' };
    case 'viva':
      return { name: 'viva' };
    case 'sources':
      return { name: 'sources' };
    default:
      return { name: 'notFound' };
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function routeHref(path: string): string {
  return `#/${path}`;
}
