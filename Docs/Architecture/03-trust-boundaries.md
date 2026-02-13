# 03 — Trust Boundaries and Security Controls (Phase 1)

## Trust Zones

```mermaid
flowchart TB
    subgraph Z1[Zone 1: Untrusted Client Environment]
        B[Browser Runtime]
        F[Raw File Bytes]
        H[Client Hashing + Optional Encryption]
        B --> F --> H
    end

    subgraph Z2[Zone 2: Entrustory API Boundary]
        API[API Controllers]
        VAL[Schema Validation]
        AUTH[JWT + RLS-backed authorization]
        API --> VAL --> AUTH
    end

    subgraph Z3[Zone 3: Integrity Core]
        MERKLE[Deterministic Merkle Builder]
        SIGN[Ed25519 Signer]
    end

    subgraph Z4[Zone 4: Data Plane]
        DB[(Postgres)]
        ST[(Storage)]
        LOG[(Audit + Verification Logs)]
    end

    subgraph Z5[Zone 5: Public Verification]
        PUB[Verify Endpoint]
        KEY[Public Keys]
    end

    H --> API
    AUTH --> MERKLE --> DB
    AUTH --> SIGN --> DB
    AUTH --> ST
    AUTH --> LOG
    API --> PUB --> KEY
```

## Boundary Risks + Control Mapping

- **Client tampering risk** → Hashes and proofs must be independently recomputable.
- **API payload manipulation** → Strict schema validation + canonicalization.
- **Database tampering risk** → Signature verification must fail on altered records.
- **Malicious record deletion** → Append-only timeline_events via DB trigger.
- **Verification abuse** → Rate limits + IP throttling + verification logs.

## Security Invariants

1. No trust in client-provided timestamps.
2. No UPDATE/DELETE on immutable timeline tables.
3. Signature verification must be possible without backend cooperation.
4. Encryption keys for zero-knowledge mode are never persisted server-side.
