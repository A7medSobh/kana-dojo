import { toHiragana } from 'wanakana';
import type { IVocabObj } from '@/entities/vocabulary';

const normalize = (value: string): string =>
  value.trim().normalize('NFC').toLowerCase();

/**
 * A lone English infinitive marker or article is optional. Compound prefixes
 * such as "to the" are preserved because removing both can change meaning
 * (for example, "to the point" is not equivalent to "point").
 */
const OPTIONAL_MEANING_PREFIX =
  /^(?:to(?!\s+(?:the|an|a)\s+)\s+|(?:the|an|a)\s+)/;

/**
 * Meanings in the data use the single ellipsis character ("well then…"),
 * but people type three dots (or more), so every ellipsis spelling is
 * folded to a canonical "..." before comparing.
 */
const ELLIPSIS_VARIANTS = /…|\.{2,}/g;

const normalizeMeaning = (value: string): string =>
  normalize(value)
    .replace(ELLIPSIS_VARIANTS, '...')
    .replace(OPTIONAL_MEANING_PREFIX, '');

export const isVocabularyMeaningAnswerCorrect = (
  vocabulary: IVocabObj,
  answer: string,
  isReverse: boolean | undefined,
): boolean => {
  const normalizedAnswer = isReverse
    ? normalize(answer)
    : normalizeMeaning(answer);
  if (!normalizedAnswer) return false;

  if (!isReverse) {
    return vocabulary.meanings.some(
      meaning => normalizeMeaning(meaning) === normalizedAnswer,
    );
  }

  return (
    normalize(vocabulary.word) === normalizedAnswer ||
    toHiragana(normalizedAnswer) ===
      toHiragana(normalize(vocabulary.reading))
  );
};
