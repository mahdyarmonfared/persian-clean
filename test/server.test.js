const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../src/server/server');

describe('PersianClean - Web Studio Server & API', () => {
  let server;
  const PORT = 3999;

  before(async () => {
    server = createServer();
    await new Promise((resolve) => {
      server.listen(PORT, '127.0.0.1', resolve);
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('GET /api/health should return 200 ok', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.app, 'persian-clean');
  });

  it('POST /api/clean should clean text and return metrics', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'كتاب ها در سال 2026 توليد مي شود.'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.cleaned.includes('کتاب‌ها'), true);
    assert.equal(data.cleaned.includes('۲۰۲۶'), true);
    assert.equal(data.cleaned.includes('می‌شود'), true);
    assert.equal(data.stats.arabicCharsFixed > 0, true);
    assert.equal(data.stats.zwnjAdded > 0, true);
  });

  it('GET / should serve the Studio index.html', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.equal(html.includes('PersianClean'), true);
  });

  it('Security: Path traversal attempts should return 403 Forbidden', async () => {
    const status = await new Promise((resolve) => {
      http.get({ hostname: '127.0.0.1', port: PORT, path: '/%2e%2e/%2e%2e/package.json' }, (res) => {
        resolve(res.statusCode);
      });
    });
    assert.equal(status, 403);
  });
});
