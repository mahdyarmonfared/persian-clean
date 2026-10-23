/**
 * PersianClean - Core Aggregator
 */

const { normalizeCharacters, convertDigits, PERSIAN_DIGITS, ARABIC_DIGITS, ENGLISH_DIGITS } = require('./normalizer');
const { ZWNJ, cleanExtraneousZwnj, applyZwnj } = require('./zwnj');
const { fixPunctuation } = require('./punctuation');

/**
 * Master Persian text beautifier and typography cleaner.
 */
function cleanPersianText(text, options = {}) {
  if (typeof text !== 'string') return '';

  let res = text;

  // 1. Character Normalization (Arabic Yeh/Kaf/Heh/Kashida)
  if (options.normalizeChars !== false) {
    res = normalizeCharacters(res);
  }

  // 2. Zero-Width Non-Joiner (ZWNJ) Application
  if (options.zwnj !== false) {
    res = applyZwnj(res);
  } else {
    res = cleanExtraneousZwnj(res);
  }

  // 3. Punctuation and Typography
  if (options.fixPunctuation !== false) {
    res = fixPunctuation(res, options);
  }

  // 4. Digits Conversion
  if (options.digits === 'fa' || options.digits === true || options.digits === undefined) {
    res = convertDigits(res, 'fa');
  } else if (options.digits === 'en') {
    res = convertDigits(res, 'en');
  }

  return res;
}

/**
 * Calculates typographical statistics and diff metrics.
 */
function getCleaningStats(original, cleaned) {
  const orig = String(original || '');
  const cln = String(cleaned || '');

  const origZwnj = (orig.match(/\u200C/g) || []).length;
  const clnZwnj = (cln.match(/\u200C/g) || []).length;
  const arabicYehKaf = (orig.match(/[\u064A\u0649\u0643\u0640]/g) || []).length;
  const words = orig.trim() ? orig.trim().split(/\s+/).length : 0;
  const chars = orig.length;

  return {
    wordCount: words,
    charCount: chars,
    zwnjAdded: Math.max(0, clnZwnj - origZwnj),
    totalZwnj: clnZwnj,
    arabicCharsFixed: arabicYehKaf,
    isModified: orig !== cln
  };
}

module.exports = {
  cleanPersianText,
  getCleaningStats,
  normalizeCharacters,
  convertDigits,
  applyZwnj,
  cleanExtraneousZwnj,
  fixPunctuation,
  ZWNJ,
  PERSIAN_DIGITS,
  ARABIC_DIGITS,
  ENGLISH_DIGITS
};
