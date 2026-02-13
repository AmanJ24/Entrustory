# Entrustory

A cryptographically secure platform that creates tamper-evident, verifiable proof of digital work ownership without exposing the original content.

## Development status

Development has started with a **Phase 1 backend foundation** in `apps/api`:

- Deterministic Merkle root generation from SHA-256 hashes
- Ed25519 signing with canonical payload format
- Public key endpoint
- Create-version and verify-proof API endpoints
- Node test coverage for cryptographic invariants

## Quick start

```bash
npm install
npm run dev:api
```

API base: `http://localhost:3001/api/v1`

### Endpoints

- `GET /health`
- `GET /public-key`
- `POST /versions`
- `POST /verify`

### Test

```bash
npm run test:api
```
