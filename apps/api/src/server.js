import http from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  buildMerkleRoot,
  canonicalPayload,
  createSigningContext
} from './crypto.js';
import {
  appendVerificationLog,
  getTimeline,
  getVerificationLogsByVersion,
  getVersion,
  saveVersion
} from './store.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, status, payload) {
  setCors(res);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function isHex64(v) {
  return typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
}

function isUuid(v) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

function validateCreateVersion(body) {
  if (!body || !isUuid(body.work_item_id) || !Array.isArray(body.files) || body.files.length < 1) return false;

  const hashes = new Set();
  for (const f of body.files) {
    if (
      typeof f.file_name !== 'string' ||
      !f.file_name.length ||
      !Number.isInteger(f.file_size) ||
      f.file_size < 0 ||
      !isHex64(f.sha256_hash) ||
      (f.encrypted_storage_path !== undefined && typeof f.encrypted_storage_path !== 'string')
    ) {
      return false;
    }

    if (hashes.has(f.sha256_hash)) return false;
    hashes.add(f.sha256_hash);
  }

  return true;
}

export function createApiServer({ signing = createSigningContext() } = {}) {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      setCors(res);
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'GET' && req.url === '/api/v1/health') {
      return json(res, 200, { ok: true, service: 'entrustory-api' });
    }

    if (req.method === 'GET' && req.url === '/api/v1/public-key') {
      return json(res, 200, { kid: signing.kid, public_key: signing.publicKeyBase64, algorithm: 'Ed25519' });
    }

    if (req.method === 'POST' && req.url === '/api/v1/versions') {
      const body = await readBody(req);
      if (!validateCreateVersion(body)) return json(res, 400, { error: 'Invalid request payload' });

      const version_id = crypto.randomUUID();
      const server_timestamp = new Date().toISOString();
      const merkle_root = buildMerkleRoot(body.files.map((f) => f.sha256_hash));
      const payload = canonicalPayload({ version_id, merkle_root, server_timestamp, kid: signing.kid });
      const signature = signing.sign(payload);

      const record = saveVersion({
        version_id,
        version_number: 1,
        work_item_id: body.work_item_id,
        server_timestamp,
        merkle_root,
        signature,
        kid: signing.kid,
        files: body.files
      });

      return json(res, 201, record);
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/v1/versions/')) {
      const versionId = req.url.replace('/api/v1/versions/', '');
      if (!isUuid(versionId)) return json(res, 400, { error: 'Invalid version id' });

      const record = getVersion(versionId);
      if (!record) return json(res, 404, { error: 'Version not found' });

      return json(res, 200, record);
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/v1/timeline/')) {
      const workItemId = req.url.replace('/api/v1/timeline/', '');
      if (!isUuid(workItemId)) return json(res, 400, { error: 'Invalid work item id' });
      return json(res, 200, { events: getTimeline(workItemId) });
    }

    if (req.method === 'GET' && req.url?.startsWith('/api/v1/verification-logs/')) {
      const versionId = req.url.replace('/api/v1/verification-logs/', '');
      if (!isUuid(versionId)) return json(res, 400, { error: 'Invalid version id' });
      return json(res, 200, { logs: getVerificationLogsByVersion(versionId) });
    }

    if (req.method === 'POST' && req.url === '/api/v1/verify') {
      const body = await readBody(req);
      if (!body || !isUuid(body.version_id) || !isHex64(body.sha256_hash)) {
        return json(res, 400, { error: 'Invalid request payload' });
      }

      const record = getVersion(body.version_id);
      if (!record) return json(res, 404, { error: 'Version not found' });

      const hash_match = record.files.some((f) => f.sha256_hash === body.sha256_hash);
      const payload = canonicalPayload({
        version_id: record.version_id,
        merkle_root: record.merkle_root,
        server_timestamp: record.server_timestamp,
        kid: record.kid
      });

      const signature_valid = signing.verify(payload, record.signature, signing.publicKeyBase64);
      const result = {
        verified: hash_match && signature_valid,
        hash_match,
        signature_valid,
        version_id: record.version_id,
        merkle_root: record.merkle_root,
        server_timestamp: record.server_timestamp,
        kid: record.kid
      };

      appendVerificationLog({
        version_id: record.version_id,
        submitted_hash: body.sha256_hash,
        is_match: result.verified
      });

      return json(res, 200, result);
    }

    return json(res, 404, { error: 'Not found' });
  });

  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT || 3001);
  createApiServer().listen(port, () => {
    console.log(`Entrustory API listening on :${port}`);
  });
}
