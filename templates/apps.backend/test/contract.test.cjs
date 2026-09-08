const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFile } = require('node:fs/promises');
const { createApp } = require('../dist/src/create-app.js');
const { apiConfiguration } = require('../dist/src/api.config.js');
const { createApiDocument, publishApiDocument } = require('@packages/api-contracts/nest');
const { stableJson, validateExample } = require('@packages/api-contracts');

test('runtime JSON and actual health response match the offline artifact, including CORS', async () => {
  const app = await createApp();
  const spec = JSON.parse(await readFile('generated/openapi.json', 'utf8'));
  publishApiDocument(app, createApiDocument(app, apiConfiguration));
  try {
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const health = await fetch(url + '/health', { headers: { Origin: 'http://localhost:3002' } });
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('access-control-allow-origin'), 'http://localhost:3002');
    const body = await health.json();
    assert.deepEqual(body, { status: 'ok' });
    validateExample(spec, spec.paths['/health'].get.responses['200'].content['application/json'].schema, body);
    assert.equal(stableJson(await (await fetch(url + '/openapi.json')).json()), stableJson(spec));
    assert.equal((await fetch(url + '/missing')).status, 404);
  } finally {
    await app.close();
  }
});
