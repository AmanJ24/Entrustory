# 02 — Data Flow Contracts (Phase 1)

## A) Create Signed Version

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (Browser)
    participant A as API (Express)
    participant S as Signature Service
    participant D as Supabase Postgres
    participant O as Supabase Storage

    C->>C: SHA-256 each file
    C->>C: Optional AES-256-GCM encrypt
    C->>A: POST /api/v1/versions (hash set, metadata)
    A->>A: Validate JWT + request schema
    A->>A: Sort hashes lexicographically
    A->>A: Build deterministic Merkle root
    A->>D: Insert versions + file_hashes + timeline_events
    A->>S: Sign canonical payload(version_id, merkle_root, server_ts)
    S-->>A: signature + kid
    A->>O: Store encrypted file blobs (optional)
    A-->>C: 201 proof record
```

### Canonical request contract (draft)

```json
{
  "work_item_id": "uuid",
  "files": [
    {
      "file_name": "design-v3.fig",
      "file_size": 421337,
      "sha256_hash": "hex-string-64",
      "encrypted_storage_path": "optional/path"
    }
  ]
}
```

### Canonical response contract (draft)

```json
{
  "version_id": "uuid",
  "version_number": 3,
  "merkle_root": "hex-string-64",
  "server_timestamp": "2026-02-13T18:40:11.000Z",
  "signature": "base64",
  "kid": "signing-key-2026-q1"
}
```

## B) Public Verification

```mermaid
sequenceDiagram
    autonumber
    participant U as Public User
    participant A as Verify API
    participant D as Supabase Postgres

    U->>A: POST /api/v1/verify (proof_id + hash)
    A->>A: Validate abuse controls/rate limits
    A->>D: Load proof + file hash set + signature + kid
    A->>A: Recompute Merkle inclusion
    A->>A: Verify Ed25519 signature via public key(kid)
    A->>D: Insert verification_logs
    A-->>U: match result + proof metadata
```

## Contract Rules (must-haves)

1. Hashes are lowercase hex; 64-char fixed length.
2. Merkle construction is deterministic and independent of upload order.
3. `server_timestamp` is generated server-side only.
4. Signature payload is canonicalized to stable byte representation.
5. `kid` is mandatory in all signed responses for long-term verification.
