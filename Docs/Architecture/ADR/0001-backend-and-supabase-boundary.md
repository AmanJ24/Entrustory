# ADR-0001: Backend + Supabase Boundary

## Status
Accepted

## Context
Entrustory must deliver cryptographic integrity guarantees while keeping operations lean for early-stage rollout.

## Decision
Use Node.js + Express as the API/control plane with Supabase for Auth, PostgreSQL, and Storage.

## Consequences
- Faster MVP velocity and managed infrastructure.
- Must define strict RLS and trigger-based immutability in SQL.
- Clear boundary where cryptographic signing remains in backend service layer.
