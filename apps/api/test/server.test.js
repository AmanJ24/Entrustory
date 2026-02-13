import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiServer } from '../src/server.js';

async function withServer(run) {
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('version create -> fetch -> verify -> logs/timeline flow', async () => {
  await withServer(async (baseUrl) => {
    const work_item_id = '11111111-1111-4111-8111-111111111111';
    const sha = 'a'.repeat(64);

    const createRes = await fetch(`${baseUrl}/versions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        work_item_id,
        files: [{ file_name: 'a.txt', file_size: 1, sha256_hash: sha }]
      })
    });

    assert.equal(createRes.status, 201);
    const version = await createRes.json();
    assert.equal(version.work_item_id, work_item_id);

    const getRes = await fetch(`${baseUrl}/versions/${version.version_id}`);
    assert.equal(getRes.status, 200);

    const verifyRes = await fetch(`${baseUrl}/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ version_id: version.version_id, sha256_hash: sha })
    });

    assert.equal(verifyRes.status, 200);
    const verify = await verifyRes.json();
    assert.equal(verify.verified, true);

    const timelineRes = await fetch(`${baseUrl}/timeline/${work_item_id}`);
    const timeline = await timelineRes.json();
    assert.equal(timeline.events.length >= 1, true);
    assert.equal(timeline.events[0].event_type, 'VersionCreated');

    const logsRes = await fetch(`${baseUrl}/verification-logs/${version.version_id}`);
    const logs = await logsRes.json();
    assert.equal(logs.logs.length >= 1, true);
    assert.equal(logs.logs[0].is_match, true);
  });
});

test('rejects duplicate hashes in same version payload', async () => {
  await withServer(async (baseUrl) => {
    const payload = {
      work_item_id: '22222222-2222-4222-8222-222222222222',
      files: [
        { file_name: 'a.txt', file_size: 1, sha256_hash: 'b'.repeat(64) },
        { file_name: 'b.txt', file_size: 2, sha256_hash: 'b'.repeat(64) }
      ]
    };

    const res = await fetch(`${baseUrl}/versions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 400);
  });
});
