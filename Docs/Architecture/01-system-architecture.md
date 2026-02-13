# 01 — System Architecture (Phase 1)

## Objective

Define production-oriented runtime architecture for Entrustory using:

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Data/Auth/Storage: Supabase
- Integrity primitives: SHA-256, deterministic Merkle tree, Ed25519 signatures

## Component Architecture

```mermaid
flowchart LR
    subgraph Client[Client Tier]
        UI[Web App\nReact + TS]
        WC[Web Crypto API\nSHA-256 / AES-256-GCM]
        UI --> WC
    end

    subgraph Api[Application Tier]
        GW[Express API Gateway]
        VC[Version Service]
        VF[Verification Service]
        SG[Signature Service\nEd25519]
        GW --> VC
        GW --> VF
        VC --> SG
        VF --> SG
    end

    subgraph Data[Supabase Tier]
        AU[Supabase Auth]
        DB[(PostgreSQL + RLS)]
        ST[(Object Storage)]
    end

    subgraph Ops[Ops Tier]
        AL[Audit/Verification Logs]
        BK[Backup + Restore]
        RL[Rate Limit Layer\n(redis planned)]
    end

    UI -->|JWT| GW
    GW --> AU
    VC --> DB
    VF --> DB
    VC --> ST
    GW --> AL
    DB --> BK
    ST --> BK
    GW -.optional future.-> RL
```

## Deployment Topology (Initial)

- Single web deployment for frontend.
- Single API deployment for backend.
- Supabase-managed Postgres/Auth/Storage.
- No queue in Phase 1; queue boundary is reserved for Phase 16 optimization.

## Service Responsibilities

- **Version Service**
  - Accept canonical file hash set.
  - Build deterministic Merkle root.
  - Persist version + file_hashes + timeline event.
  - Return signed proof payload.

- **Verification Service**
  - Accept proof_id + (hash OR uploaded file-derived hash).
  - Recompute path/inclusion.
  - Verify Ed25519 signature against published key.
  - Persist verification log.

- **Signature Service**
  - Canonicalizes signing payload bytes.
  - Signs using active private key.
  - Provides key ID (`kid`) for key rotation compatibility.

## Non-Functional Constraints

- TLS-only transport.
- Strict JSON schema validation for all write APIs.
- Append-only guarantee enforced at DB layer, not app logic alone.
- All UTC timestamps originate from server/database clock.
