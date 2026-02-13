import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMerkleRoot, canonicalPayload, createSigningContext } from '../src/crypto.js';

test('buildMerkleRoot is deterministic regardless of file order', () => {
  const a = 'a'.repeat(64);
  const b = 'b'.repeat(64);
  const c = 'c'.repeat(64);

  const root1 = buildMerkleRoot([a, b, c]);
  const root2 = buildMerkleRoot([c, a, b]);

  assert.equal(root1, root2);
  assert.equal(root1.length, 64);
});

test('canonical payload is signable and verifiable', () => {
  const signer = createSigningContext();
  const payload = canonicalPayload({
    version_id: '7fb8c7ff-7e9d-44e3-b605-c6219e0f6f56',
    merkle_root: 'f'.repeat(64),
    server_timestamp: '2026-02-13T18:40:11.000Z',
    kid: signer.kid
  });

  const sig = signer.sign(payload);
  const valid = signer.verify(payload, sig, signer.publicKeyBase64);

  assert.equal(valid, true);
});
