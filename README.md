# Entrustory

A cryptographically secure platform that creates tamper-evident, verifiable proof of digital work ownership without exposing the original content.

## Development status

Development is active across:

- **Phase 1 API foundation** (`apps/api`)
  - Deterministic Merkle root generation from SHA-256 hashes
  - Ed25519 signing with canonical payload format (`version_id:merkle_root:server_timestamp:kid`)
  - Append-only timeline and verification logs (in-memory bootstrap store)
- **Phase 2 data architecture artifacts** (`db/`)
  - SQL schema migration
  - RLS policy baseline
- **Web app MVP** (`apps/web`)
  - Browser file hashing (Web Crypto SHA-256)
  - Create proof and verify proof screens wired to API

## Quick start

```bash
npm run test:api
npm run dev:api
npm run dev:web
```

- API base: `http://localhost:3001/api/v1`
- Web app: `http://localhost:4173`

### API endpoints

- `GET /health`
- `GET /public-key`
- `POST /versions`
- `GET /versions/:version_id`
- `POST /verify`
- `GET /timeline/:work_item_id`
- `GET /verification-logs/:version_id`

### Current implementation note

Persistence is in-memory for now in API runtime. Next step is wiring these endpoints to Supabase tables and RLS policies from `db/`.
