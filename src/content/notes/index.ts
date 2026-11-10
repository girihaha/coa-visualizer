import type { TopicNote } from './types';
import { UNIT1_NOTES } from './unit1';
import { UNIT2_NOTES } from './unit2';
import { UNIT3_NOTES } from './unit3';
import { UNIT4_NOTES } from './unit4';
import { UNIT5_NOTES } from './unit5';

export type { TopicNote };

const NOTES: Record<string, TopicNote> = { ...UNIT1_NOTES, ...UNIT2_NOTES, ...UNIT3_NOTES, ...UNIT4_NOTES, ...UNIT5_NOTES };

export function findNote(topicId: string): TopicNote | undefined {
  return NOTES[topicId];
}
