/**
 * PersianClean - Punctuation & Typography Formatting Module
 */

/**
 * Standardizes Persian punctuation, quotes, spacing, and brackets.
 */
function fixPunctuation(text, options = {}) {
  if (typeof text !== 'string') return '';

  let res = text;

  // 1. Convert English/Arabic punctuation to standard Persian punctuation
  if (options.persianPunctuation !== false) {
    // Replace comma in Persian context (surrounded by Persian/Arabic or space)
    res = res.replace(/([آ-ی\s]),([آ-ی\s])/gu, '$1،$2');
    res = res.replace(/([آ-ی]);([آ-ی\s])/gu, '$1؛$2');
    res = res.replace(/([آ-ی])\?+/gu, '$1؟');
  }

  // 2. Standardize ellipsis (... -> …)
  res = res.replace(/\.{3,}/g, '…');

  // 3. Convert quotation marks ("..." or “...”) to Persian guillemets («...»)
  if (options.guillemets !== false) {
    res = res.replace(/(?:^|\s)["“]([^"”]+)["”](?:\s|$|[.,!؛،؟])/gu, (match, content) => {
      return match.replace(/["“][^"”]+["”]/, `«${content.trim()}»`);
    });
  }

  // 4. Bracket & Parentheses trimming: no space inside, space outside
  // e.g. ( متن ) -> (متن)
  res = res.replace(/([(\[{«])\s+/gu, '$1');
  res = res.replace(/\s+([)\]}»])/gu, '$1');

  // 5. Spacing around punctuation:
  // No space before: . ! : ، ؛ ؟ …
  res = res.replace(/\s+([.!:،؛؟…])/gu, '$1');

  // Exactly one space after punctuation (if followed by a word/letter)
  res = res.replace(/([.!:،؛؟…])([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیa-zA-Z0-9])/gu, '$1 $2');

  // 6. Normalize multiple horizontal whitespace to single space (preserves newlines)
  res = res.replace(/[^\S\r\n]{2,}/g, ' ');

  // 7. Normalize excessive line breaks (more than 2 newlines -> 2)
  res = res.replace(/(\r?\n){3,}/g, '$1$1');

  return res.trim();
}

module.exports = {
  fixPunctuation
};
