// The package's `test` script pointed at this directory before any test existed,
// so it passed with zero tests -- a green signal that meant nothing.
//
// These run against dist/, so `test` depends on `build` in turbo.json, matching
// docs-core, api-contracts and mcp.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { runInTransaction } from '../dist/src/transactions.js';

// A stand-in for PrismaClient. Only $transaction is exercised, and the point is
// the wiring: that the transaction-scoped client reaches the callback and the
// callback's result is returned. Behavior that needs a real database belongs in
// an integration test against a test database.
const fakePrisma = (recorder) => ({
  $transaction: (callback) => {
    recorder.opened = true;

    return callback({ scoped: true });
  },
});

void test('runInTransaction passes the transaction-scoped client to the callback', async () => {
  const recorder = {};
  let received;

  await runInTransaction(fakePrisma(recorder), (tx) => {
    received = tx;

    return Promise.resolve(null);
  });

  assert.equal(recorder.opened, true);
  assert.deepEqual(received, { scoped: true });
});

void test('runInTransaction returns the callback result', async () => {
  const result = await runInTransaction(fakePrisma({}), () => Promise.resolve({ id: 'row_1' }));

  assert.deepEqual(result, { id: 'row_1' });
});

void test('runInTransaction propagates a rejection instead of swallowing it', async () => {
  await assert.rejects(
    runInTransaction(fakePrisma({}), () => Promise.reject(new Error('constraint violation'))),
    /constraint violation/,
  );
});
