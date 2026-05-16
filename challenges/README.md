# Zero to Dev — Challenge Contribution Guide

Thank you for contributing CTF challenges to Zero to Dev! This guide explains how to create and submit challenges using our YAML format.

## Quick Start

1. Create a YAML file following the format below
2. Validate your YAML locally
3. Submit via the Challenge Import API or as a pull request

## YAML Challenge Format

```yaml
# Required fields
title: "Challenge Name"                    # Short, descriptive title
slug: "challenge-name"                     # URL-safe identifier (lowercase, hyphens only)
phase: 1                                   # 1-6 (see phase descriptions below)
difficulty: "easy"                         # easy | medium | hard | expert
category: "web"                            # web | crypto | forensics | reversing | pwn | encoding | scripting | binary
expected_flag: "ZTD{flag_here}"           # Must follow ZTD{...} format
description: "Short one-line description"  # Brief description for the challenge card
briefing: |                                # Multi-line briefing in Markdown
  This is the full briefing text that sets the scene for the challenge.
  It should explain the scenario and what the player needs to do.

  ## Hints
  - Start by examining the file headers
  - The encoding is multi-layered

setup: |                                   # Multi-line setup instructions in Markdown
  # Download the challenge files
  wget https://example.com/challenge/files.tar.gz
  tar xzf files.tar.gz

  # Run the vulnerable application
  python3 challenge.py

tools_hint: "Concepts: Base64, hex encoding\nTools: Python, CyberChef\nYou do NOT need: any network access"
hint: "Optional hint text for players who are stuck"  # Optional hint
xp_reward: 100                             # XP points (suggested: 80-350)
author: "Your Name"                        # Your name or handle
```

## Phase Descriptions

| Phase | Title | Focus | Suggested Difficulty |
|-------|-------|-------|---------------------|
| 1 | Foundations | Encoding, basic ciphers, scripting | easy |
| 2 | Data Structures & Algorithms | Pattern finding, hash puzzles | easy-medium |
| 3 | Systems & Networks | Log analysis, packet capture, port scanning | medium |
| 4 | Web Security | SQL injection, XSS, CSRF, IDOR, SSRF | medium-hard |
| 5 | Advanced Security | Crypto, forensics, reversing, pwn | hard-expert |
| 6 | Capstone | Multi-stage, cross-domain challenges | hard-expert |

## Category Descriptions

| Category | Description | Example |
|----------|-------------|---------|
| `web` | Web application vulnerabilities | SQL injection, XSS, CSRF |
| `crypto` | Cryptographic challenges | Breaking weak ciphers, hash cracking |
| `forensics` | Digital forensics | Log analysis, file recovery, steganography |
| `reversing` | Reverse engineering | Binary analysis, decompilation |
| `pwn` | Binary exploitation | Buffer overflows, ROP chains |
| `encoding` | Encoding/decoding challenges | Base64, hex, multi-layer encoding |
| `scripting` | Scripting/automation challenges | Math puzzles, data processing |
| `binary` | Binary analysis | File format analysis, metadata extraction |

## XP Reward Guidelines

| Difficulty | Suggested XP |
|-----------|-------------|
| easy | 80-100 |
| medium | 100-150 |
| hard | 150-250 |
| expert | 250-350 |

## Flag Format Rules

All flags **must** follow the `ZTD{...}` format:
- Prefix: `ZTD{`
- Content: alphanumeric, underscores, hyphens only
- Suffix: `}`
- Example: `ZTD{b4s3_64_d3c0d3}`

## Submission Methods

### Method 1: API Import (Admin)

Submit your challenge YAML via the import API:

```bash
curl -X POST /api/challenges/import?XTransformPort=3000 \
  -H "Content-Type: application/yaml" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --data-binary @your-challenge.yaml
```

### Method 2: Pull Request

1. Fork the repository
2. Add your YAML file to `challenges/community/`
3. Submit a pull request with the title: `[Challenge] Your Challenge Name`

## Validation Checklist

Before submitting, verify:
- [ ] Title is descriptive and under 80 characters
- [ ] Slug is URL-safe (lowercase, hyphens, no spaces)
- [ ] Phase is between 1 and 6
- [ ] Difficulty is one of: easy, medium, hard, expert
- [ ] Category is one of the approved categories
- [ ] Expected flag follows ZTD{...} format
- [ ] Briefing provides clear context and objectives
- [ ] Setup instructions are reproducible
- [ ] Tools hint mentions relevant concepts and tools
- [ ] XP reward matches the suggested range for the difficulty
- [ ] Author field is filled in

## Example Challenges

See the `examples/` directory for complete example YAML files:
- `01-base64-onion.yaml` — An easy encoding challenge
- `02-log-detective.yaml` — A medium forensics challenge
- `03-ssrf-heist.yaml` — A hard web security challenge

## Questions?

Open an issue on GitHub or reach out to the Zero to Dev team. Happy hacking!
