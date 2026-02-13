import http from 'node:http';
import { buildMerkleRoot, canonicalPayload, createSigningContext } from './crypto.js';
import { getVersion, saveVersion } from './store.js';
import crypto from 'node:crypto';

const signing = createSigningContext();

function json(res, status, payload) {
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
  return body.files.every(
    (f) =>
      typeof f.file_name === 'string' &&
      f.file_name.length > 0 &&
      Number.isInteger(f.file_size) &&
      f.file_size >= 0 &&
      isHex64(f.sha256_hash) &&
      (f.encrypted_storage_path === undefined || typeof f.encrypted_storage_path === 'string')
  );
}

const server = http.createServer(async (req, res) => {
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
    return json(res, 200, {
      verified: hash_match && signature_valid,
      hash_match,
      signature_valid,
      version_id: record.version_id,
      merkle_root: record.merkle_root,
      server_timestamp: record.server_timestamp,
      kid: record.kid
    });
  }

  return json(res, 404, { error: 'Not found' });
});

const port = Number(process.env.PORT || 3001);
server.listen(port, () => {
  console.log(`Entrustory API listening on :${port}`);
});
