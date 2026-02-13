import crypto from 'node:crypto';

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function buildMerkleRoot(hashes) {
  if (!hashes?.length) throw new Error('At least one file hash is required');

  let level = [...hashes].sort();
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(sha256Hex(Buffer.from(left + right, 'hex')));
    }
    level = next;
  }
  return level[0];
}

function toPemFromBase64Key(base64, isPrivate) {
  const der = Buffer.from(base64, 'base64');
  return isPrivate
    ? crypto.createPrivateKey({ key: der, type: 'pkcs8', format: 'der' })
    : crypto.createPublicKey({ key: der, type: 'spki', format: 'der' });
}

export function createSigningContext() {
  let privateKey;
  let publicKey;

  const privateDerBase64 = process.env.ENTRUSTORY_SIGNING_PRIVATE_KEY_DER_BASE64;
  const publicDerBase64 = process.env.ENTRUSTORY_SIGNING_PUBLIC_KEY_DER_BASE64;

  if (privateDerBase64 && publicDerBase64) {
    privateKey = toPemFromBase64Key(privateDerBase64, true);
    publicKey = toPemFromBase64Key(publicDerBase64, false);
  } else {
    const pair = crypto.generateKeyPairSync('ed25519');
    privateKey = pair.privateKey;
    publicKey = pair.publicKey;
  }

  const kid = process.env.ENTRUSTORY_SIGNING_KID ?? 'dev-key-1';
  const publicKeyDerBase64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');

  return {
    kid,
    publicKeyBase64: publicKeyDerBase64,
    sign(message) {
      return crypto.sign(null, Buffer.from(message, 'utf8'), privateKey).toString('base64');
    },
    verify(message, signatureBase64, publicKeyBase64) {
      const pub = toPemFromBase64Key(publicKeyBase64, false);
      return crypto.verify(null, Buffer.from(message, 'utf8'), pub, Buffer.from(signatureBase64, 'base64'));
    }
  };
}

export function canonicalPayload({ version_id, merkle_root, server_timestamp, kid }) {
  return `${version_id}:${merkle_root}:${server_timestamp}:${kid}`;
}
