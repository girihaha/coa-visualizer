import { describe, it, expect } from 'vitest';
import { parseRoute, routeHref } from '@/app/router';
import { UNITS } from '@/content/curriculum';
import { findNote } from '@/content/notes';
import { findSimulator } from '@/components/sim/simulators/registry';

describe('router', () => {
  it('parses every route', () => {
    expect(parseRoute('')).toEqual({ name: 'home' });
    expect(parseRoute('#/')).toEqual({ name: 'home' });
    expect(parseRoute('#/unit/3')).toEqual({ name: 'unit', unitId: 3 });
    expect(parseRoute('#/topic/booth')).toEqual({ name: 'topic', topicId: 'booth' });
    expect(parseRoute('#/simulate/pipeline')).toEqual({ name: 'simulate', simulatorId: 'pipeline' });
    expect(parseRoute('#/lab')).toEqual({ name: 'lab' });
    expect(parseRoute('#/formulas')).toEqual({ name: 'formulas' });
    expect(parseRoute('#/viva')).toEqual({ name: 'viva' });
    expect(parseRoute('#/sources')).toEqual({ name: 'sources' });
  });

  it('rejects unknown and malformed routes', () => {
    expect(parseRoute('#/unit/9')).toEqual({ name: 'notFound' });
    expect(parseRoute('#/unit/abc')).toEqual({ name: 'notFound' });
    expect(parseRoute('#/topic')).toEqual({ name: 'notFound' });
    expect(parseRoute('#/nowhere')).toEqual({ name: 'notFound' });
  });

  it('builds hrefs that parse back', () => {
    expect(parseRoute(routeHref('unit/2'))).toEqual({ name: 'unit', unitId: 2 });
  });
});

describe('curriculum integrity', () => {
  const topics = UNITS.flatMap((u) => u.topics);

  it('topic ids are unique', () => {
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
  });

  it('every linked simulator exists', () => {
    for (const t of topics) if (t.simulatorId) expect(findSimulator(t.simulatorId), t.id).toBeDefined();
  });

  it('every topic has learning notes with key points', () => {
    for (const t of topics) {
      const note = findNote(t.id);
      expect(note, t.id).toBeDefined();
      expect(note!.keyPoints.length, t.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('every unit has at least one simulator', () => {
    for (const u of UNITS) expect(u.topics.some((t) => t.simulatorId), `unit ${u.id}`).toBe(true);
  });
});
