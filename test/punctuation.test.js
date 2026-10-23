const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { fixPunctuation } = require('../src/core/punctuation');

describe('PersianClean - Punctuation Module', () => {
  it('should convert English comma, semicolon, question mark to Persian in Persian context', () => {
    const input = 'سلام, چطوری؟ خوبم; تشکر?';
    const output = fixPunctuation(input);
    assert.equal(output.includes('،'), true);
    assert.equal(output.includes('؛'), true);
    assert.equal(output.includes('؟'), true);
  });

  it('should fix spacing around punctuation (no space before, one space after)', () => {
    const input = 'متن اول  ،  متن دوم   .   متن سوم !';
    const output = fixPunctuation(input);
    assert.equal(output.includes('  ،'), false);
    assert.equal(output.includes('   .'), false);
    assert.equal(output.includes(' !'), false);
  });

  it('should convert quotation marks to Persian guillemets', () => {
    const input = 'او گفت "سلام دنیا" و رفت.';
    const output = fixPunctuation(input);
    assert.equal(output.includes('«سلام دنیا»'), true);
  });

  it('should normalize bracket spacing', () => {
    const input = 'این یک ( عبارت تستی ) است.';
    const output = fixPunctuation(input);
    assert.equal(output.includes('(عبارت تستی)'), true);
  });
});
