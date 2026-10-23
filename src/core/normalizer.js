/**
 * PersianClean - Character Normalizer Module
 * Unifies Arabic/Persian glyphs, normalizes digits, and cleans Kashida.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Replaces Arabic characters with standard Persian counterparts.
 */
function normalizeCharacters(text) {
  if (typeof text !== 'string') return '';

  let res = text;

  // Arabic Yeh to Persian Yeh (ي, ى -> ی)
  res = res.replace(/[\u064A\u0649]/g, '\u06CC');

  // Arabic Kaf to Persian Kaf (ك -> ک)
  res = res.replace(/\u0643/g, '\u06A9');

  // Arabic Heh with two dots (ة -> ه or ت depending on common suffixes)
  // Usually isolated or end of word ة becomes ه (e.g. دوره)
  res = res.replace(/\u0629/g, '\u0647');

  // Remove Tatweel / Kashida (ـ)
  res = res.replace(/\u0640+/g, '');

  // Remove duplicate diacritics / Tanwin / Tashdid
  res = res.replace(/([\u064B-\u0652])\1+/g, '$1');

  return res;
}

/**
 * Converts English and Arabic digits to Persian digits (or to English if target='en').
 */
function convertDigits(text, target = 'fa') {
  if (typeof text !== 'string') return '';

  let res = text;

  if (target === 'fa') {
    // English -> Persian
    for (let i = 0; i < 10; i++) {
      res = res.replace(new RegExp(ENGLISH_DIGITS[i], 'g'), PERSIAN_DIGITS[i]);
      res = res.replace(new RegExp(ARABIC_DIGITS[i], 'g'), PERSIAN_DIGITS[i]);
    }
  } else if (target === 'en') {
    // Persian/Arabic -> English
    for (let i = 0; i < 10; i++) {
      res = res.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
      res = res.replace(new RegExp(ARABIC_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
    }
  }

  return res;
}

module.exports = {
  normalizeCharacters,
  convertDigits,
  PERSIAN_DIGITS,
  ARABIC_DIGITS,
  ENGLISH_DIGITS
};
