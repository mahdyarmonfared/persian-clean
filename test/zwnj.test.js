const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  cleanExtraneousZwnj,
  applyZwnj,
  ZWNJ
} = require('../src/core/zwnj');

describe('PersianClean - ZWNJ Rule Engine', () => {
  it('should clean duplicate and boundary ZWNJs', () => {
    const input = `سلام${ZWNJ}${ZWNJ}دنیا ${ZWNJ} تست ${ZWNJ}`;
    const cleaned = cleanExtraneousZwnj(input);
    assert.equal(cleaned.includes(`${ZWNJ}${ZWNJ}`), false);
    assert.equal(cleaned.endsWith(ZWNJ), false);
  });

  it('should attach verbal prefixes (می / نمی)', () => {
    const input = 'من می روم و او نمی آید';
    const result = applyZwnj(input);
    assert.equal(result.includes(`می${ZWNJ}روم`), true);
    assert.equal(result.includes(`نمی${ZWNJ}آید`), true);
  });

  it('should attach plural suffixes (ها / های)', () => {
    const input = 'کتاب ها و خانه های زیبا';
    const result = applyZwnj(input);
    assert.equal(result.includes(`کتاب${ZWNJ}ها`), true);
    assert.equal(result.includes(`خانه${ZWNJ}های`), true);
  });

  it('should attach comparative suffixes (تر / ترین)', () => {
    const input = 'راه بزرگ تر و قشنگ ترین منظره';
    const result = applyZwnj(input);
    assert.equal(result.includes(`بزرگ${ZWNJ}تر`), true);
    assert.equal(result.includes(`قشنگ${ZWNJ}ترین`), true);
  });

  it('should attach prefix بی', () => {
    const input = 'فردی بی تفاوت و اثر بی نظیر';
    const result = applyZwnj(input);
    assert.equal(result.includes(`بی${ZWNJ}تفاوت`), true);
    assert.equal(result.includes(`بی${ZWNJ}نظیر`), true);
  });
});
