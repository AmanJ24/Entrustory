# 1️⃣ Landing Page

First impression:
“Secure. Technical. Trustworthy.”

## Hero Section

Top left: Entrustory logo
Top right:

* Login
* Get Started
* Documentation

Center hero:

Headline:

> Cryptographically Verifiable Proof of Digital Work

Subtext:

> Create tamper-evident, signed proof records for your files without exposing the original content.

Primary Button:
[ Create Your First Proof ]

Secondary Button:
[ How It Works ]

Background:

* Subtle animated grid
* Light particle lines connecting nodes
* Minimal motion

Right side:
Animated visual:

* File → SHA-256 → Merkle Tree → Signature → Verified

---

## Section: How It Works (Visual Timeline)

Step 1: Hash in Browser
Step 2: Merkle Root Generated
Step 3: Server Signs Record
Step 4: Immutable Timeline Created
Step 5: Publicly Verifiable

Each step has small icon + short description.

---

## Section: Why Entrustory?

3 columns:

* Tamper-Evident
* Zero-Knowledge Option
* Public Verification

Clean, minimal icons.

---

## Section: Built for Professionals

Grid cards:

* Developers
* Designers
* Researchers
* Agencies
* Enterprises

---

## Section: Public Verification Demo

Mini input:
Upload file + proof ID
Button: Verify Now

This increases trust immediately.

---

## Footer

Links:

* Documentation
* API
* Security
* Privacy Policy
* Terms
* Status Page

---

# 2️⃣ Login Page

Very minimal.

Centered card.

Title:
Welcome Back

Fields:
Email
Password

Buttons:
Login
Forgot Password

Below:
Create Account

Dark background. Clean. No distractions.

---

# 3️⃣ Sign Up Page

Title:
Create Your Entrustory Account

Fields:
Full Name
Email
Password

Checkbox:
I understand encrypted files cannot be recovered without password.

Clear and serious tone.

---

# 4️⃣ User Dashboard (After Login)

First impression:
Professional security dashboard.

Left Sidebar:

* Dashboard
* Work Items
* Verification
* Activity
* API
* Settings
* Billing

Top bar:

* Search
* Notifications
* Profile dropdown

---

## Dashboard Overview Page

Cards:

Total Work Items
Total Versions
Total Proofs
Verification Attempts

Below:
Graph:
Proof creation over time

Second graph:
Verification attempts

Right side:
Recent Activity timeline

---

# 5️⃣ Work Items Page

Grid view or list view toggle.

Each card shows:

* Title
* Latest version
* Merkle root (shortened)
* Last updated
* Integrity status badge

Clicking opens Work Item Detail.

---

# 6️⃣ Work Item Detail Page

Top:

Title
Description
Integrity badge

Buttons:
Add Version
Export Proof
Archive

---

## Version Timeline (Main Section)

Vertical timeline:

Version 1

* Created at timestamp
* Merkle root
* Signature ID

Version 2
Version 3

Clicking a version expands:

File list:

* file_name
* sha256
* status: Verified / Modified

Option:
Generate Merkle Proof

---

# 7️⃣ Add Version Page

Drag & drop zone:

Drop files here

Below:
List of files with:

* File size
* SHA-256 (auto-calculated)
* Remove button

Button:
Create Signed Version

While hashing:
Progress animation.

---

# 8️⃣ Public Verification Page

Accessible without login.

Simple layout:

Upload file
OR
Paste SHA256

Enter Proof ID

Button:
Verify

After verification:

Green screen:
✔ Verified
Shows:

* Version ID
* Timestamp
* Signature validation
* Merkle inclusion proof

If mismatch:
Red screen:
Hash does not match any stored proof.

---

# 9️⃣ Activity Page

List view:

* Version created
* File added
* Verification attempt
* Workspace shared

With:
IP address
Timestamp

---

# 🔟 API Page

For developers.

Shows:

API Key
Regenerate key
Usage stats

Code examples:

POST /api/v1/versions
GET /api/v1/verify

Clean documentation style like Stripe.

---

# 1️⃣1️⃣ Settings Page

Tabs:

Profile
Security
Workspace
Encryption
Billing

Security Tab:

* Active sessions
* Logout all
* 2FA toggle (future)

Encryption Tab:

* Enable zero-knowledge mode
* Password reminder warning

---

# 1️⃣2️⃣ Billing Page

Plan overview:

Current Plan: Pro
Storage Used
Upgrade Plan

Simple pricing cards.

---

# 1️⃣3️⃣ Admin Monitoring Panel (Internal Only)

Hidden route.

Shows:

* System health
* Verification abuse alerts
* Rate limit logs
* Error metrics

Very clean internal tool look.

---

# Visual Feel Summary

If someone visits your site, they should feel:

* This is serious.
* This is infrastructure.
* This is cryptographic, not gimmicky.
* This looks enterprise-ready.

No gradients everywhere.
No flashy Web3 vibes.
No clutter.

Minimal. Precise. Security-focused.
