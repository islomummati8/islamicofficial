const assert = require('node:assert/strict');
const { test } = require('node:test');
const chatHandler = require('../api/chat.js');

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: '',
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body = '') {
      this.body = body;
    },
    json() {
      return this.body ? JSON.parse(this.body) : null;
    }
  };
}

function createRequest(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      origin: 'https://islamicofficial-zikr.web.app',
      'content-type': 'application/json',
      'x-real-ip': `test-${Math.random()}`,
      'content-length': '28'
    },
    body: { request: 'Ertangi zikr rejamni tuz' },
    ...overrides
  };
}

test('rejects origins outside the website domains', async () => {
  const res = createResponse();
  await chatHandler(createRequest({ headers: { ...createRequest().headers, origin: 'https://example.org' } }), res);
  assert.equal(res.statusCode, 403);
  assert.match(res.json().error, /ruxsat/);
});

test('handles preflight requests for the Zikr website', async () => {
  const req = createRequest({ method: 'OPTIONS' });
  const res = createResponse();
  await chatHandler(req, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['access-control-allow-origin'], req.headers.origin);
});

test('reports missing server-side Gemini configuration without exposing a key field', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const res = createResponse();
    await chatHandler(createRequest(), res);
    assert.equal(res.statusCode, 503);
    assert.doesNotMatch(res.body, /key|kalit/i);
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('validates Gemini output before returning a personal schedule', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  global.fetch = async (url, options) => {
    assert.match(String(url), /gemini-2\.5-flash:generateContent/);
    assert.equal(new URL(String(url)).searchParams.has('key'), false);
    assert.equal(options.headers['x-goog-api-key'], 'server-only-test-secret');
    const body = JSON.parse(options.body);
    assert.match(body.contents[0].parts[0].text, /ertangi zikr/i);
    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: { parts: [{ text: '[{"id":"subhanallah","time":"06:00","target":33}]' }] }
        }]
      })
    };
  };
  try {
    const res = createResponse();
    await chatHandler(createRequest(), res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), {
      plan: [{ id: 'subhanallah', time: '06:00', target: 33 }]
    });
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('rejects malformed or oversized user prompts before contacting Gemini', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  global.fetch = async () => {
    throw new Error('Gemini must not be called for an invalid prompt.');
  };
  try {
    for (const body of [{ request: '' }, { request: 'x'.repeat(501) }]) {
      const res = createResponse();
      await chatHandler(createRequest({ body }), res);
      assert.equal(res.statusCode, 400);
    }
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('rejects AI output containing an unapproved dhikr phrase', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [{
        content: { parts: [{ text: '[{"id":"invented","time":"06:00","target":33}]' }] }
      }]
    })
  });
  try {
    const res = createResponse();
    await chatHandler(createRequest(), res);
    assert.equal(res.statusCode, 502);
    assert.match(res.json().error, /yaroqli reja/i);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('throttles repeated calls from a single IP address', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'server-only-test-secret';
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      candidates: [{
        content: { parts: [{ text: '[{"id":"subhanallah","time":"06:00","target":33}]' }] }
      }]
    })
  });
  try {
    const responses = [];
    const ip = `rate-test-${Date.now()}`;
    for (let index = 0; index < 6; index += 1) {
      const res = createResponse();
      const req = createRequest();
      req.headers['x-real-ip'] = ip;
      await chatHandler(req, res);
      responses.push(res);
    }
    assert.deepEqual(responses.map(response => response.statusCode), [200, 200, 200, 200, 200, 429]);
    assert.equal(responses[5].headers['retry-after'], '60');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
