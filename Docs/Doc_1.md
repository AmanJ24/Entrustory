# 1️⃣ FINAL DATABASE ARCHITECTURE (Production-Grade)

### Core Tables

## users

Managed by Supabase Auth
Additional profile table:

```
profiles
- id (uuid, pk, matches auth.users.id)
- full_name
- created_at
- subscription_plan
- is_active
```

---

## work_items

```
- id (uuid, pk)
- owner_id (uuid, fk -> profiles.id)
- title
- description
- merkle_root
- current_version_id
- created_at
- is_archived (boolean)
```

---

## versions

```
- id (uuid, pk)
- work_item_id (uuid, fk)
- version_number (int)
- merkle_root
- created_at
- created_by (uuid)
```

Merkle root per version. Not per entire work item.
This prevents tree rebuild complexity.

---

## file_hashes

```
- id (uuid)
- version_id (uuid)
- file_name
- file_size
- sha256_hash
- encrypted_storage_path (nullable)
- created_at
```

Add unique constraint:

```
unique (sha256_hash, owner_id)
```

For duplicate detection.

---

## timeline_events (APPEND ONLY)

```
- id (uuid)
- work_item_id
- version_id (nullable)
- event_type
- event_metadata (jsonb)
- created_at
- created_by
```

STRICT RULE:
No UPDATE. No DELETE.
Database trigger blocks them.

---

## audit_logs (security monitoring)

```
- id
- user_id
- action_type
- ip_address
- user_agent
- metadata (jsonb)
- created_at
```

---

## verification_logs

```
- id
- proof_id
- submitted_hash
- ip_address
- is_match
- created_at
```

---

# 2️⃣ MERKLE TREE STRATEGY (Final Model)

Per version only.

When user adds files:

1. Client computes SHA256
2. Backend sorts hashes lexicographically
3. Build Merkle tree deterministically
4. Store:

   * Leaf hashes
   * Merkle root
   * Tree depth

We do NOT store intermediate nodes.
We generate Merkle proof on demand.

Why?
Reduces storage. Deterministic rebuild possible.

---

# 3️⃣ CRYPTOGRAPHIC MODEL (SaaS-Grade)

## Hashing

SHA-256 client side only.

## Timestamp Authority

Server signs each version record:

```
version_signature = sign(
  merkle_root + created_at + version_id
)
```

Use:
Ed25519 keypair (backend private key)

Store public key openly for verification.

Now even if DB compromised:
Attacker cannot forge signatures.

---

# 4️⃣ LEGAL DEFENSIBILITY MODEL

To make this usable in disputes:

### Evidence Bundle Export (PDF + JSON)

Contains:

* File SHA256
* Merkle root
* Version ID
* Server timestamp (UTC)
* Backend signature
* Verification instructions
* Public verification URL

Important:
Use server-generated UTC timestamp only.
Never client timestamp.

Later:
Optional blockchain anchoring.

---

# 5️⃣ THREAT MODEL (Complete)

We explicitly defend against:

### 1. Backend insider tampering

Solved by:

* Append-only logs
* Signature verification
* Merkle consistency

### 2. Database breach

Attacker cannot forge:

* Signatures
* Historical Merkle roots

### 3. Hash brute force via public portal

Solved by:

* Rate limiting
* IP throttling
* Proof ID required

### 4. Replay attacks

Verification endpoint requires:
Signed nonce per request.

### 5. Supabase storage tampering

File integrity verified by stored SHA256.

### 6. Malicious team member deleting records

Append-only timeline.
Soft archive only.

---

# 6️⃣ ZERO-KNOWLEDGE ENCRYPTION (Production Model)

Client-side encryption using:

AES-256-GCM

Key derived from:
PBKDF2(password, salt)

Server stores:
Encrypted file only.

Server never sees plaintext.

User must understand:
Lost password = unrecoverable file.

We clearly warn users.

---

# 7️⃣ API DESIGN (Stable Public API)

Versioned API:

```
/api/v1/work-items
/api/v1/versions
/api/v1/verify
/api/v1/export
```

All responses signed with server key.

JWT auth required except public verify endpoint.

---

# 8️⃣ SCALABILITY PLAN

Initial:
Single Node + Supabase

Scale Phase:

* Move to containerized backend
* Add Redis for rate limiting
* Add job queue for Merkle builds
* CDN for static frontend
* Storage bucket separation per tenant

---

# 9️⃣ BILLING ARCHITECTURE

Plan tiers:

Free:

* 5 work items
* No encrypted storage
* No team workspace

Pro:

* Unlimited work items
* Encrypted storage
* Export bundles
* API access

Enterprise:

* Team workspace
* Audit logs extended
* SLA
* Dedicated storage bucket

Stripe integration later.

---

# 🔟 OPERATIONAL SECURITY

You must implement:

* Environment variable isolation
* Private key stored in secure vault
* Rotatable signing keys
* Daily DB backups
* Monitoring alerts

Never hardcode keys.
Never log hashes in plaintext logs.

---

# 11️⃣ FINAL PRE-BUILD CHECKLIST

Before coding:

* [ ] Final ER diagram drawn
* [ ] Threat model documented
* [ ] Signature scheme decided
* [ ] Encryption scheme finalized
* [ ] API contract written
* [ ] Rate limit strategy defined
* [ ] Backup recovery tested
* [ ] Legal wording for terms drafted

Only after this, development begins.

