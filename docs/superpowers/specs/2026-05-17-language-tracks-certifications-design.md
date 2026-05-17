# Design: Language Tracks & Certifications UI

**Date:** 2026-05-17
**Status:** Approved (user requested continuation to completion)

## Overview

Add multi-language learning tracks (like Exercism) and project-based certifications (like freeCodeCamp) to the ZeroToDev platform. This transforms the platform from a single Python-focused curriculum into a multi-language, multi-path learning platform.

## Architecture

### View System (Single-Page App)

Extend the existing `View` type in `src/app/page.tsx`:
- Add: `paths`, `track-detail`, `certification-detail`
- `paths`: Main hub with tabbed view of tracks and certifications
- `track-detail`: Individual language track with lessons and progress
- `certification-detail`: Individual certification with projects and verification

### New Components

| File | Purpose |
|------|---------|
| `src/components/paths/PathsPage.tsx` | Main paths hub: tabbed view, track grid, certification grid |
| `src/components/paths/TrackDetail.tsx` | Individual track view: lessons, progress, exercises |
| `src/components/paths/CertificationDetail.tsx` | Individual cert view: projects, submissions, verification |

### New API Routes

| Route | Purpose |
|-------|---------|
| `GET /api/tracks` | List all language tracks with user progress |
| `GET /api/tracks/[slug]` | Single track detail with lessons |
| `POST /api/tracks/[slug]/progress` | Update track progress |
| `GET /api/certifications` | List all certifications with user status |
| `GET /api/certifications/[slug]` | Single cert detail with projects |
| `POST /api/certifications/[slug]/submit` | Submit a certification project |
| `POST /api/certifications/[slug]/claim` | Claim earned certification |

### Navigation Changes

- Rename "Lessons" → "Paths" in nav bar
- Mobile menu updated accordingly
- Dashboard "Continue Lessons" quick action → "Language Tracks"
- Add "Certifications" as new quick action card

## UI Design

### Paths Page (Main Hub)

**Layout:**
- Header: "Learning Paths" with subtitle "Choose your path to mastery"
- Tabs: "Language Tracks" | "Certifications"
- Tab 1 (Tracks): Grid of 9 track cards (2-3 columns responsive)
- Tab 2 (Certs): Grid of 5 certification cards (2-3 columns responsive)

**Track Card:**
- Language icon (Lucide icon by track slug)
- Track name, difficulty badge (colored)
- Short description (2 lines max)
- Progress bar (0-100%)
- Lesson count badge
- Hover: border color matches language color

**Certification Card:**
- Icon, title, description
- Required projects count, estimated hours
- Status badge: "Not Started" | "In Progress" | "Earned"
- "Earned" status: gold border + star icon

### Track Detail View

**Header:**
- Back button to Paths
- Track icon, name, description
- Overall progress bar
- "Start Track" or "Continue" CTA

**Content:**
- Ordered lesson list
- Each lesson: title, description, completion status, XP reward
- Click lesson → existing lesson view (filtered by trackId)
- Locked lessons show padlock icon

### Certification Detail View

**Header:**
- Back button to Paths
- Certification icon, title, description
- Progress: "X of Y projects completed"
- "Claim Certification" button (disabled until all projects done)

**Content:**
- Ordered project list
- Each project: title, description, requirements (expandable), status
- "Submit Project" button → dialog with form:
  - Project description (textarea)
  - Repository URL (input)
  - Live demo URL (optional input)
- Verification status: "Pending Review" | "Approved" | "Needs Revision"

## Dashboard Integration

### Welcome Section
- If user has active track: "Continue your {Track} track" → navigates to track-detail
- If no active track: "Start a learning path" → navigates to paths

### Quick Actions
- Replace "Continue Lessons" card with "Language Tracks" card
- Add "Certifications" card
- Keep "Hacking Labs", "Interview Prep", "Portfolio"

### Stats
- Keep existing 4 stat cards (XP, Phase, Streak, Labs)
- Add track/cert progress to skill radar or secondary section

## Styling

### Color System
- Track cards use language-specific accent colors:
  - Python: `#3776AB` (blue)
  - JavaScript: `#F7DF1E` (yellow)
  - TypeScript: `#3178C6` (blue)
  - C: `#A8B9CC` (gray)
  - C++: `#00599C` (dark blue)
  - Rust: `#DEA584` (orange)
  - Go: `#00ADD8` (cyan)
  - Java: `#ED8B00` (orange)
  - Bash: `#4EAA25` (green)

### Reused Components
- `Card`, `Badge`, `Progress`, `Button` from shadcn/ui
- `difficultyColors` map for difficulty badges
- Existing stat card pattern for progress display
- Existing dialog pattern for project submission

## Data Model

Already exists in Prisma schema:
- `LanguageTrack` — slug, name, description, icon, color, difficulty, order
- `UserTrackProgress` — userId, trackId, progress (JSON), startedAt, completedAt
- `Certification` — slug, title, description, icon, requiredProjects, estimatedHours, order
- `CertificationProject` — certificationId, title, description, requirements, language, order
- `UserCertification` — userId, certificationId, status, submittedAt, earnedAt
- `Lesson.trackId` — optional FK to LanguageTrack

## Error Handling

- Track not found → 404 with back to Paths button
- Certification not found → 404 with back to Paths button
- Project submission fails → toast error, retry option
- Claim certification without all projects → toast warning
- Unauthenticated → redirect to login

## Testing

- Manual testing of all views
- Verify progress tracking persists
- Verify certification submission flow
- Verify dashboard integration
- Test responsive layout on mobile

## Implementation Order

1. API routes for tracks and certifications
2. PathsPage component (main hub)
3. TrackDetail component
4. CertificationDetail component
5. Navigation and dashboard integration
6. Seed script updates (already done)
7. Testing and polish
