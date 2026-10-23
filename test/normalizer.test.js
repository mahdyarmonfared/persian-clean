const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeCharacters,
  convertDigits,
  PERSIAN_DIGITS,
  ARABIC_DIGITS,
  ENGLISH_DIGITS
} = require('../src/core/normalizer');

describe('PersianClean - Normalizer Module', () => {
  it('should unify Arabic Yeh and Kaf to Persian characters', () => {
    const input = 'كتاب يار زيبا كودك';
    const expected = 'کتاب یار زیبا کودک';
    assert.equal(normalizeCharacters(input), expected);
  });

  it('should remove Arabic Tatweel (Kashida)', () => {
    const input = 'ایــــران زیبـــــا';
    const expected = 'ایران زیبا';
    assert.equal(normalizeCharacters(input), expected);
  });

  it('should normalize Teh Marbuta to Heh', () => {
    const input = 'دورة آموزشي';
    const expected = 'دوره آموزشی';
    assert.equal(normalizeCharacters(input), expected);
  });

  it('should convert English digits to Persian digits', () => {
    const input = 'Version 2026 released on 12/05';
    const expected = 'Version ۲۰۲۶ released on ۱۲/۰۵';
    assert.equal(convertDigits(input, 'fa'), expected);
  });

  it('should convert Arabic digits to Persian digits', () => {
    const input = 'السنة ١٤٤٦ هجرية و ٥ طلاب';
    const expected = 'السنة ۱۴۴۶ هجرية و ۵ طلاب';
    assert.equal(convertDigits(input, 'fa'), expected);
  });

  it('should convert Persian digits to English digits when requested', () => {
    const input = 'قیمت: ۲۰۵۰۰ تومان';
    const expected = 'قیمت: 20500 تومان';
    assert.equal(convertDigits(input, 'en'), expected);
  });
});
