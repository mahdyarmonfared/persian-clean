/**
 * PersianClean - Zero-Width Non-Joiner (ZWNJ / نیم‌فاصله) Rule Engine
 */

const ZWNJ = '\u200C';
const PERSIAN_CHARS = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیئييكة';
const PUNCT_OR_SPACE = '(?=[\\s.,!؛،؟«»()\\[\\]{}…:;\\-–—]|$)';
const START_OR_SPACE = '(?<=[\\s(«\\[{]|^)';

/**
 * Cleans unwanted or redundant ZWNJ characters.
 */
function cleanExtraneousZwnj(text) {
  if (typeof text !== 'string') return '';

  let res = text;

  // 1. Multiple consecutive ZWNJs -> single ZWNJ
  res = res.replace(/\u200C{2,}/g, ZWNJ);

  // 2. ZWNJ adjacent to whitespace -> keep whitespace, drop ZWNJ
  res = res.replace(/\s+\u200C+/g, ' ');
  res = res.replace(/\u200C+\s+/g, ' ');

  // 3. ZWNJ at start or end of text or lines
  res = res.replace(/^\u200C+|\u200C+$/gm, '');

  // 4. ZWNJ adjacent to non-Persian punctuation or symbols
  res = res.replace(/([.,;:!?()[\]{}<>"'«»؛،؟])\u200C+/g, '$1');
  res = res.replace(/\u200C+([.,;:!?()[\]{}<>"'«»؛،؟])/g, '$1');

  // 5. ZWNJ between non-Persian/Latin characters
  res = res.replace(/([a-zA-Z0-9])\u200C+/g, '$1');
  res = res.replace(/\u200C+([a-zA-Z0-9])/g, '$1');

  return res;
}

/**
 * Automatically applies ZWNJ based on Persian grammatical prefix and suffix rules.
 */
function applyZwnj(text) {
  if (typeof text !== 'string') return '';

  let res = cleanExtraneousZwnj(text);

  // --- PREFIX RULES ---

  // 1. می / نمی before verbs (e.g. می روم -> می‌روم)
  res = res.replace(new RegExp(`${START_OR_SPACE}(ن?می)\\s+([${PERSIAN_CHARS}])`, 'gu'), `$1${ZWNJ}$2`);

  // 2. بی prefix (e.g. بی نظیر -> بی‌نظیر, بی تفاوت -> بی‌تفاوت)
  res = res.replace(new RegExp(`${START_OR_SPACE}(بی)\\s+([${PERSIAN_CHARS}])`, 'gu'), `$1${ZWNJ}$2`);

  // --- SUFFIX RULES ---

  // 3. Plural ها and related enclitics (e.g. کتاب ها -> کتاب‌ها, کتاب هایم -> کتاب‌هایم)
  res = res.replace(new RegExp(`([${PERSIAN_CHARS}])\\s+(ها(?:ی(?:م|مان|ت|تان|ش|شان)?)?)${PUNCT_OR_SPACE}`, 'gu'), `$1${ZWNJ}$2`);

  // 4. Comparative تر and ترین (e.g. زیباتر, بزرگ تر -> بزرگ‌تر)
  res = res.replace(new RegExp(`([${PERSIAN_CHARS}])\\s+(تر(?:ین)?)${PUNCT_OR_SPACE}`, 'gu'), `$1${ZWNJ}$2`);

  // 5. Common derivational suffixes: مند, پذیر, شناس, شناسی, ساز, سازی, سنج, سنجی, گونه, وار
  res = res.replace(new RegExp(`([${PERSIAN_CHARS}])\\s+(مند|پذیر|شناس(?:ی)?|ساز(?:ی)?|سنج(?:ی)?|گونه|وار)${PUNCT_OR_SPACE}`, 'gu'), `$1${ZWNJ}$2`);

  // 6. Possessive/Enclitic pronouns following silent Heh (ه / ة): خانه‌ام, جامعه‌مان, پروژه‌اش
  res = res.replace(new RegExp(`([هة])\\s+(ام|ات|اش|مان|تان|شان|ای)${PUNCT_OR_SPACE}`, 'gu'), `$1${ZWNJ}$2`);

  return res;
}

module.exports = {
  ZWNJ,
  cleanExtraneousZwnj,
  applyZwnj
};
