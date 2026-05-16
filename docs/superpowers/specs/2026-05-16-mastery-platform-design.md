# ZeroToDev Mastery Platform - Design Spec

**Date:** 2026-05-16
**Author:** System
**Status:** Draft

## Overview

Transform ZeroToDev from a basic lesson platform into a mastery-grade CS and cybersecurity learning platform. Six features: MDX content rendering, schema expansion for projects/assessments, portfolio page, ready-check assessments, exploit lab integration, and interview prep mode.

## Architecture

### 1. MDX Content System

**Problem:** Lessons render as raw text. No code highlighting, no diagrams, no interactive content.

**Solution:** Install `next-mdx-remote` and `remark/rehype` plugins. Store lesson content as `.mdx` files in `content/lessons/`. Each MDX file can include interactive code blocks, diagrams via Mermaid, and embedded quiz components.

**Components:**
- `src/components/mdx/LessonRenderer.tsx` — renders MDX with custom components
- `src/components/mdx/CodeBlock.tsx` — syntax-highlighted code with copy/run buttons
- `src/components/mdx/Diagram.tsx` — Mermaid diagram rendering
- `content/lessons/` — directory for MDX lesson files
- API route `/api/lessons/[slug]/content` — serves MDX content with frontmatter metadata

**Data flow:** MDX files live in `content/lessons/` as source. The seed script loads them into the database. The API serves content from the DB. During development, a hot-reload script watches `content/` and updates the DB automatically.

### 2. Prisma Schema Expansion

**New models:**

```prisma
model Project {
  id          String   @id @default(cuid())
  lessonId    String
  title       String
  slug        String   @unique
  description String
  brief       String   // project brief/requirements
  rubric      String   // JSON: grading criteria
  starterRepo String?  // GitHub template URL
  order       Int
  xpReward    Int      @default(200)
  category    String   // "cs" | "cyber" | "systems"
  createdAt   DateTime @default(now())

  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  submissions ProjectSubmission[]
}

model ProjectSubmission {
  id          String   @id @default(cuid())
  userId      String
  projectId   String
  repoUrl     String
  description String?
  status      String   @default("pending") // pending | reviewed | approved
  score       Int?     // 0-100
  feedback    String?
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

model Assessment {
  id          String   @id @default(cuid())
  phaseNumber Int
  title       String
  slug        String   @unique
  description String
  timeLimit   Int      // minutes
  passScore   Int      // percentage needed to pass
  order       Int
  isRequired  Boolean  @default(true)
  createdAt   DateTime @default(now())

  problems    AssessmentProblem[]
  attempts    AssessmentAttempt[]
}

model AssessmentProblem {
  id            String   @id @default(cuid())
  assessmentId  String
  title         String
  type          String   // "coding" | "multiple_choice" | "short_answer"
  description   String
  starterCode   String?
  language      String?
  testCases     String?  // JSON: test cases for auto-graded
  correctAnswer String?  // for MC/short answer
  points        Int      @default(10)
  order         Int

  assessment    Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
}

model AssessmentAttempt {
  id            String   @id @default(cuid())
  userId        String
  assessmentId  String
  startedAt     DateTime @default(now())
  submittedAt   DateTime?
  score         Int?     // 0-100
  passed        Boolean?
  answers       String   // JSON: per-problem answers

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessment    Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([userId, assessmentId])
}

model InterviewProblem {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  difficulty  String   // "easy" | "medium" | "hard"
  category    String   // "arrays" | "trees" | "graphs" | "dp" | "strings" | "design" | "security"
  description String
  starterCode String
  language    String   @default("python")
  testCases   String   // JSON
  hints       String?  // JSON: progressive hints
  solution    String   // reference solution (admin only)
  xpReward    Int      @default(50)
  createdAt   DateTime @default(now())

  attempts    InterviewAttempt[]
}

model InterviewAttempt {
  id          String   @id @default(cuid())
  userId      String
  problemId   String
  code        String
  passed      Boolean
  timeSpent   Int      // seconds
  hintsUsed   Int      @default(0)
  attemptNum  Int
  createdAt   DateTime @default(now())

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem     InterviewProblem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

model PortfolioArtifact {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "project" | "exercise" | "lab" | "assessment" | "writeup"
  title       String
  description String
  url         String?  // GitHub repo, demo URL, etc.
  sourceId    String   // ID of the source (lesson, lab, etc.)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, sourceId])
}
```

**Phase gate logic:** User can advance to phase N+1 only when:
- All lessons in phase N are completed
- All exercises in phase N are passed
- Required assessment for phase N is passed (score >= passScore)
- At least 1 portfolio artifact from phase N exists

### 3. Portfolio Page

**Route:** `/profile/portfolio`
**Features:**
- Auto-generates artifacts from completed projects, labs, assessments
- User can add custom artifacts (GitHub repos, blog posts, writeups)
- Featured artifacts appear at top
- Export as markdown/JSON for sharing
- Public portfolio view at `/u/[username]/portfolio`

**Components:**
- `src/components/portfolio/PortfolioPage.tsx` — main page
- `src/components/portfolio/ArtifactCard.tsx` — individual artifact display
- `src/components/portfolio/ArtifactForm.tsx` — add/edit custom artifact
- API: `GET /api/portfolio` — user's artifacts
- API: `POST /api/portfolio` — add custom artifact
- API: `GET /api/portfolio/[username]` — public portfolio

### 4. Ready-Check Assessments

**Route:** `/assessments/[slug]`
**Features:**
- Timed coding challenges (multiple problems, single session)
- Auto-graded via Piston API (same as exercises)
- Score calculated on submission
- Pass/fail with detailed breakdown
- One attempt per 24 hours (unlimited retries but only first counts for gating)
- Required assessments gate phase progression

**Components:**
- `src/components/assessment/AssessmentPage.tsx` — main assessment view
- `src/components/assessment/AssessmentTimer.tsx` — countdown timer with warning
- `src/components/assessment/AssessmentResults.tsx` — score breakdown
- API: `GET /api/assessments/[slug]` — assessment details + problems
- API: `POST /api/assessments/[slug]/submit` — submit all answers
- API: `GET /api/assessments` — list available assessments

### 5. Exploit Lab Integration

**Concept:** After each "build" exercise, an "exploit" exercise targets the same concept.

**Schema extension:** Add `exploitTargetId` to `Exercise` model (references another exercise).

**Data model change:**
```prisma
// In Exercise model:
exploitTargetId String?
exploitTarget   Exercise? @relation("ExploitTarget", fields: [exploitTargetId], references: [id])
exploitedBy     Exercise[] @relation("ExploitTarget")
```

**Flow:**
1. User completes "Build a HTTP server" exercise
2. Platform unlocks "Exploit: HTTP Request Smuggling" exercise
3. Exploit exercise loads the user's best submission as the target
4. User writes exploit code in the editor, platform runs exploit against target via Piston API
5. Success = exploit produces expected output (e.g., crashes target, extracts data), XP awarded, vulnerability explanation shown
6. Both target and exploit run in isolated Piston containers with no network access

**Components:**
- `src/components/exploit/ExploitEditor.tsx` — dual-pane: target code + exploit code
- `src/components/exploit/ExploitResults.tsx` — exploit chain visualization
- API: `POST /api/exercises/[id]/exploit` — run exploit against target

### 6. Interview Prep Mode

**Route:** `/interview`
**Features:**
- LeetCode-style problems organized by category and difficulty
- Timed mode (simulates real interview pressure)
- Hints available at XP cost
- Pattern recognition: problems tagged with patterns (sliding window, two pointers, etc.)
- Progress tracking: problems solved by category, difficulty distribution
- Mock interview: random problem selection, 30-minute timer

**Components:**
- `src/components/interview/InterviewPage.tsx` — main interview practice view
- `src/components/interview/ProblemList.tsx` — filterable problem list
- `src/components/interview/ProblemDetail.tsx` — single problem with editor
- `src/components/interview/MockInterview.tsx` — timed random problem
- `src/components/interview/ProgressChart.tsx` — category/difficulty breakdown
- API: `GET /api/interview/problems` — list with filters
- API: `GET /api/interview/problems/[slug]` — single problem
- API: `POST /api/interview/problems/[slug]/submit` — submit solution
- API: `GET /api/interview/progress` — user's interview progress

## File Structure

```
src/
  app/
    api/
      lessons/[slug]/content/route.ts     # NEW: MDX content serving
      portfolio/route.ts                   # NEW: user portfolio
      portfolio/[username]/route.ts        # NEW: public portfolio
      assessments/route.ts                 # NEW: list assessments
      assessments/[slug]/route.ts          # NEW: assessment details
      assessments/[slug]/submit/route.ts   # NEW: submit assessment
      interview/problems/route.ts          # NEW: list problems
      interview/problems/[slug]/route.ts   # NEW: problem detail
      interview/problems/[slug]/submit/route.ts  # NEW: submit solution
      interview/progress/route.ts          # NEW: interview progress
      exercises/[id]/exploit/route.ts      # NEW: run exploit
    assessments/
      [slug]/page.tsx                      # NEW: assessment page
    interview/
      page.tsx                             # NEW: interview prep hub
      [slug]/page.tsx                      # NEW: single problem
    profile/
      portfolio/page.tsx                   # NEW: portfolio page
    u/[username]/portfolio/page.tsx        # NEW: public portfolio
  components/
    mdx/
      LessonRenderer.tsx                   # NEW
      CodeBlock.tsx                        # NEW
      Diagram.tsx                          # NEW
    portfolio/
      PortfolioPage.tsx                    # NEW
      ArtifactCard.tsx                     # NEW
      ArtifactForm.tsx                     # NEW
    assessment/
      AssessmentPage.tsx                   # NEW
      AssessmentTimer.tsx                  # NEW
      AssessmentResults.tsx                # NEW
    exploit/
      ExploitEditor.tsx                    # NEW
      ExploitResults.tsx                   # NEW
    interview/
      InterviewPage.tsx                    # NEW
      ProblemList.tsx                      # NEW
      ProblemDetail.tsx                    # NEW
      MockInterview.tsx                    # NEW
      ProgressChart.tsx                    # NEW
  lib/
    mdx.ts                                 # NEW: MDX parsing utilities
    phase-gate.ts                          # NEW: phase progression logic
content/
  lessons/                                 # NEW: MDX lesson files
  assessments/                             # NEW: assessment problem files
  interview/                               # NEW: interview problem files
prisma/
  schema.prisma                            # MODIFIED: new models
```

## Implementation Order

1. Schema expansion + Prisma migration + seed data
2. MDX content system (foundation for all content)
3. Portfolio page (uses existing + new data)
4. Ready-check assessments (builds on exercise submission pattern)
5. Interview prep mode (similar to exercises but with timer + categories)
6. Exploit lab integration (most complex, depends on all above)

## Dependencies

- `next-mdx-remote` — MDX rendering
- `@mdx-js/loader`, `@mdx-js/react` — MDX support
- `remark-gfm` — GitHub-flavored markdown
- `rehype-highlight` — syntax highlighting
- `rehype-mermaid` — Mermaid diagrams
- Existing: Piston API for code execution, Prisma for DB, NextAuth for auth

## Security Considerations

- Assessment problems: solutions only visible to admin role
- Portfolio: public view only shows featured artifacts, user controls visibility
- Exploit lab: sandboxed execution, no network access from exploit code
- Interview problems: solutions hidden, hints gated by XP cost
- Rate limiting on all submission endpoints (already implemented)
