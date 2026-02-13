
# ENTRUSTORY

# MASTER PHASE-WISE PRODUCT & ARCHITECTURE ROADMAP

# SaaS Production Edition

---

# PHASE 0 – FOUNDATIONAL PRODUCT DEFINITION

## 0.1 Vision Definition

Entrustory is a cryptographically verifiable proof-of-work and digital ownership infrastructure that provides tamper-evident timelines, version-linked evidence sets, and public verification capability.

## 0.2 Target Users

* Developers
* Designers
* Researchers
* Writers
* Agencies
* Legal teams
* Enterprises

## 0.3 Core Value Proposition

* Independent timestamping
* Cryptographic integrity
* Zero-knowledge file storage
* Public verification portal
* Legal export readiness

## 0.4 Product Constraints

* Supabase is mandatory infrastructure
* Client-side hashing required
* Append-only log enforcement
* Deterministic Merkle generation
* Backend signature validation

Deliverables:

* Product requirement document
* Feature boundary document
* System glossary

---

# PHASE 1 – SYSTEM ARCHITECTURE DESIGN

## 1.1 System Layers

Layer 1: Client Application (React + TypeScript)
Layer 2: API Layer (Node + Express)
Layer 3: Cryptographic Engine
Layer 4: Supabase (Auth, DB, Storage)
Layer 5: Monitoring & Logging
Layer 6: Backup & Recovery

## 1.2 Trust Model Definition

* Client hashes files
* Server verifies and signs records
* Database enforces immutability
* Public verification re-computes integrity

Deliverables:

* Architecture diagram
* Data flow diagram
* Trust boundary diagram
* Key management diagram

---

# PHASE 2 – DATA ARCHITECTURE & SCHEMA FINALIZATION

## 2.1 Core Tables

* profiles
* work_items
* versions
* file_hashes
* timeline_events
* audit_logs
* verification_logs
* subscriptions
* api_keys

## 2.2 Constraints

* Unique hash per user enforcement
* Foreign key strict linking
* Insert-only timeline via DB triggers
* Soft archive only, no delete

## 2.3 Index Strategy

* Index on sha256_hash
* Index on created_at
* Composite index for verification

Deliverables:

* ER diagram
* SQL schema
* Migration scripts
* Trigger functions

---

# PHASE 3 – CRYPTOGRAPHIC ENGINE

## 3.1 Client-Side Hashing

* SHA-256 via Web Crypto API
* Large file chunk handling
* Deterministic byte reading

## 3.2 Deterministic Merkle Tree

Rules:

* Sort hashes lexicographically
* Pair left-right
* Duplicate last node if odd
* Hash concatenation with SHA-256

Store:

* Merkle root
* Leaf set

## 3.3 Server Signature Model

Algorithm: Ed25519
Signature covers:

* version_id
* merkle_root
* server_timestamp

Public key exposed via:
`/api/v1/public-key`

Deliverables:

* Crypto spec document
* Test vectors
* Proof verification script

---

# PHASE 4 – IMMUTABLE TIMELINE ENGINE

## 4.1 Append-Only Enforcement

Database trigger blocks:

* UPDATE
* DELETE

## 4.2 Timeline Events

Events:

* WorkItemCreated
* VersionCreated
* FileAdded
* ExportGenerated
* VerificationAttempt
* WorkspaceShared

Deliverables:

* Timeline event schema
* Trigger SQL
* Event type registry

---

# PHASE 5 – ZERO-KNOWLEDGE ENCRYPTION MODULE

## 5.1 Encryption Standard

AES-256-GCM
Key derivation:
PBKDF2 with 100k iterations
Random salt per file

## 5.2 Storage Model

* Encrypted file stored in Supabase Storage
* Encryption metadata stored in DB
* No plaintext storage anywhere

## 5.3 Recovery Policy

If password lost:
Irrecoverable file.
User warning required.

Deliverables:

* Encryption spec
* Client encryption flow
* Security notice documentation

---

# PHASE 6 – PUBLIC VERIFICATION INFRASTRUCTURE

## 6.1 Verification Portal

User provides:

* File OR hash
* Proof ID

System checks:

* Recompute SHA256
* Validate against stored leaf
* Recompute Merkle path
* Validate signature

## 6.2 Abuse Protection

* Rate limit via Redis
* IP throttling
* Request signature validation
* Logging of attempts

Deliverables:

* Verification API contract
* Abuse protection rules
* Logging pipeline

---

# PHASE 7 – LEGAL EVIDENCE EXPORT ENGINE

## 7.1 Evidence Bundle

Includes:

* File hash
* Version metadata
* Merkle root
* Signature
* UTC timestamp
* Public verification instructions

## 7.2 Formats

* PDF
* JSON structured file

## 7.3 Signature Validation Guide

Include public key and CLI verification instructions.

Deliverables:

* Export template
* Legal language draft
* Verification documentation

---

# PHASE 8 – TEAM WORKSPACE SYSTEM

## 8.1 Roles

* Owner
* Contributor
* Viewer

## 8.2 Row-Level Security

Supabase RLS policies:

* Owner full access
* Contributor add versions
* Viewer read-only

## 8.3 Sharing Logs

All sharing events logged in audit_logs.

Deliverables:

* RLS policy SQL
* Permission matrix
* Workspace schema

---

# PHASE 9 – ANALYTICS & DASHBOARD

## 9.1 Metrics

* Total proofs
* Version count
* Proof frequency graph
* Storage usage
* Verification attempts

## 9.2 Privacy

Analytics never expose file content.

Deliverables:

* Metrics query definitions
* Dashboard layout spec

---

# PHASE 10 – API PLATFORM

## 10.1 Public API

Endpoints:

* Create work item
* Submit version
* Retrieve proof
* Verify proof

## 10.2 API Keys

* Per-user API keys
* Rate limits per key
* Revocation mechanism

Deliverables:

* OpenAPI spec
* API key schema
* Rate limiting logic

---

# PHASE 11 – BILLING & SUBSCRIPTION SYSTEM

## 11.1 Plans

Free
Pro
Enterprise

## 11.2 Stripe Integration

* Subscription webhooks
* Plan enforcement middleware

Deliverables:

* Subscription schema
* Plan enforcement logic

---

# PHASE 12 – DEVOPS & DEPLOYMENT

## 12.1 Environments

* Development
* Staging
* Production

## 12.2 Infrastructure

* Dockerized backend
* Reverse proxy
* HTTPS enforced
* Environment variable isolation

## 12.3 Key Management

* Signing key in secure vault
* Rotation capability
* Backup of public keys

Deliverables:

* Deployment diagram
* CI/CD plan
* Incident response plan

---

# PHASE 13 – SECURITY HARDENING

## 13.1 Protections

* CORS strict policy
* Helmet middleware
* Input validation
* SQL injection prevention
* Strict JSON schema validation

## 13.2 Logging

Centralized logs:

* API access
* Verification abuse
* Login attempts

Deliverables:

* Security checklist
* Pen-test plan
* Vulnerability disclosure policy

---

# PHASE 14 – BACKUP & DISASTER RECOVERY

## 14.1 Database

Daily automated backups
Monthly restore test

## 14.2 Storage

Bucket redundancy
Integrity verification script

## 14.3 Recovery Playbook

Step-by-step restore documentation.

Deliverables:

* Backup schedule
* DR document
* Recovery simulation log

---

# PHASE 15 – THIRD-PARTY TIMESTAMP ANCHORING (OPTIONAL)

Future integration:

* Public blockchain anchoring
* Trusted timestamp authority

Store anchor hash reference in DB.

---

# PHASE 16 – PERFORMANCE OPTIMIZATION

* Background Merkle jobs
* Queue system
* Pagination enforcement
* Caching for verification

---

# PHASE 17 – ENTERPRISE FEATURES

* SLA monitoring
* Dedicated storage buckets
* Custom domain verification portal
* Audit log export

---

# PHASE 18 – COMPLIANCE & LEGAL

* Terms of Service
* Privacy Policy
* Data retention policy
* GDPR readiness
* User data deletion policy

---

# PHASE 19 – GO-TO-MARKET PREPARATION

* Landing page
* Documentation portal
* API documentation site
* Early access beta onboarding

---

# PHASE 20 – POST-LAUNCH SECURITY OPERATIONS

* Continuous monitoring
* Key rotation schedule
* Quarterly security review
* Independent security audit

---

# FINAL PRODUCT STATE

Entrustory becomes:

A cryptographically signed, append-only, privacy-preserving digital ownership infrastructure platform ready for commercial SaaS deployment.

---

