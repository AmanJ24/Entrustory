# ADR-0002: Canonical Signing Payload with Key ID

## Status
Accepted

## Context
Proof signatures must remain verifiable for years, across key rotation and infrastructure changes.

## Decision
Sign canonical payload string containing:
`version_id:merkle_root:server_timestamp:kid`
using Ed25519.

## Consequences
- Deterministic signing input reduces parsing ambiguity.
- `kid` in payload ties signature to exact public key version.
- Requires test vectors in Phase 3 to lock compatibility.
