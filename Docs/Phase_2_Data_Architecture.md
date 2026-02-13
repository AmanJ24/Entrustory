# ENTRUSTORY – Phase 2 Data Architecture & Schema Finalization

This phase turns architecture contracts into concrete PostgreSQL/Supabase artifacts.

## Deliverables added

- Initial schema migration: `db/migrations/0001_initial_schema.sql`
- RLS policy baseline: `db/policies/rls.sql`

## Scope completed

1. Core tables implemented:
   - profiles
   - work_items
   - versions
   - file_hashes
   - timeline_events
   - audit_logs
   - verification_logs

2. Constraints implemented:
   - unique `(sha256_hash, owner_id)` in `file_hashes`
   - strict FKs between version/work item/profile entities
   - append-only trigger protection for `timeline_events` (blocks UPDATE/DELETE)

3. Index strategy implemented:
   - `file_hashes(sha256_hash)`
   - `versions(created_at)`
   - composite verification lookup index

4. RLS baseline implemented:
   - owner-scoped policies for `work_items`, `versions`, `file_hashes`
   - owner-scoped select/insert for `timeline_events`

## Next

Phase 3: wire API persistence from in-memory store to Supabase tables and add cryptographic test vectors.
