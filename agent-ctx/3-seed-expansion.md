# Task 3: Massively Expand Seed Data & Create Contributor System

## Summary
Expanded the Zero to Dev platform seed data from 23 exercises and 6 labs to 55 exercises and 23 labs, and created a complete contributor system for community challenge submissions.

## Changes Made

### 1. Expanded Exercises (23 → 55, +32 new exercises)
Added 2-3 more LeetCode-style exercises to each existing lesson across all 6 phases:

**Phase 1 - Foundations (8 → 16 exercises)**
- Lesson 1.1 (Hello Python): Added "Sum of Two Numbers", "Repeat String"
- Lesson 1.2 (Variables & Data Types): Added "Even or Odd", "Count Vowels"
- Lesson 1.3 (Control Flow): Added "Factorial", "Collatz Steps"
- Lesson 1.4 (Intro to Cybersecurity): Added "ROT13 Decoder", "XOR Cipher"

**Phase 2 - DSA (6 → 12 exercises)**
- Lesson 2.1 (Arrays & Strings): Added "Group Anagrams", "Longest Common Prefix"
- Lesson 2.2 (Linked Lists & Stacks): Added "Min Stack", "Evaluate Postfix"
- Lesson 2.3 (Trees & Graphs): Added "BFS Traversal", "Max Depth of Tree"

**Phase 3 - Systems & Networks (3 → 9 exercises)**
- Lesson 3.1 (Operating Systems): Added "File Permission Parser", "Memory Allocator"
- Lesson 3.2 (Networking): Added "Subnet Calculator", "HTTP Request Parser"
- Lesson 3.3 (Linux & CLI): Added "Permission Encoder", "Grep Simulator"

**Phase 4 - Web Security (3 → 9 exercises)**
- Lesson 4.1 (SQL Injection): Added "Parameterize Query", "Input Sanitizer"
- Lesson 4.2 (XSS & CSRF): Added "URL Parameter Analyzer", "CSRF Token Validator"
- Lesson 4.3 (Authentication): Added "JWT Payload Decoder", "Rate Limiter"

**Phase 5 - Advanced Security (2 → 6 exercises)**
- Lesson 5.1 (Cryptography): Added "Caesar Brute Force", "Hash Collision Finder"
- Lesson 5.2 (Digital Forensics): Added "Timeline Builder", "Hex Dump Analyzer"

**Phase 6 - Capstone (1 → 3 exercises)**
- Lesson 6.1 (CTF Preparation): Added "Base64 Multi-Decode", "Steganography Detector"

### 2. Expanded CTF Labs (6 → 23, +17 new labs)
Added labs across all phases (previously only phases 4-5 had labs):

**Phase 1 - Foundations (3 new labs)**
- Base64 Detective (encoding, easy)
- Substitution Cipher (crypto, easy)
- Scripting Sprint (scripting, medium)

**Phase 2 - DSA (2 new labs)**
- Pattern Hunter (scripting, medium)
- Hash Detective (crypto, medium)

**Phase 3 - Systems & Networks (3 new labs)**
- Log Detective (forensics, medium)
- Port Scan Analysis (forensics, medium)
- Packet Puzzle (forensics, medium)

**Phase 4 - Web Security (3 new labs)**
- CSRF Exploit (web, medium)
- IDOR Discovery (web, medium)
- SSRF Adventure (web, hard)

**Phase 5 - Advanced Security (3 new labs)**
- Buffer Overflow Intro (pwn, hard)
- Password Vault (crypto, medium)
- Network Forensics (forensics, hard)

**Phase 6 - Capstone (3 new labs)**
- Multi-Step CTF (web, hard)
- Incident Response (forensics, expert)
- Full Stack CTF (reversing, expert)

### 3. Contributor System
Created the complete contributor challenge submission system:

**A. YAML Challenge Format Documentation** (`/challenges/README.md`)
- Comprehensive guide with field descriptions
- Phase and category reference tables
- XP reward guidelines
- Flag format rules
- Validation checklist

**B. Example Challenge YAMLs** (`/challenges/examples/`)
- `01-base64-onion.yaml` - Easy encoding challenge (Phase 1)
- `02-log-detective.yaml` - Medium forensics challenge (Phase 3)
- `03-ssrf-heist.yaml` - Hard web security challenge (Phase 4)

**C. Challenge Import API** (`/src/app/api/challenges/import/route.ts`)
- POST endpoint accepting YAML content
- Validates all required fields with type checking
- Validates slug format, phase range, difficulty/category enums
- Validates ZTD{...} flag format
- Checks slug uniqueness
- Auto-assigns order within phase
- Returns created lab data on success

## Verification
- Seed script runs successfully
- Final counts: 6 phases, 16 lessons, 55 exercises, 23 labs, 10 achievements
- Lint passes cleanly
