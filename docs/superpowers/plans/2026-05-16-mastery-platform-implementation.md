# ZeroToDev Mastery Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ZeroToDev from a basic lesson platform into a mastery-grade CS and cybersecurity learning platform with MDX rendering, portfolio, assessments, interview prep, and exploit labs.

**Architecture:** Extend existing Next.js + Prisma + NextAuth stack. New features follow existing API route patterns and component conventions. All new UI integrates into the existing single-page app in `src/app/page.tsx`.

**Tech Stack:** Next.js 16, React 19, Prisma 6, SQLite (dev), NextAuth, Monaco Editor, MDX, Tailwind CSS v4, shadcn/ui

---

## Phase 1: Schema Expansion + Seed Data

### Task 1.1: Add new Prisma models to schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add new models to the end of schema.prisma**

Append after the `LabSession` model (line 256):

```prisma
// ============================================================
// PROJECTS (Portfolio Artifacts)
// ============================================================

model Project {
  id          String   @id @default(cuid())
  lessonId    String
  title       String
  slug        String   @unique
  description String
  brief       String   // project brief/requirements
  rubric      String   @default("{}") // JSON: grading criteria
  starterRepo String?
  order       Int
  xpReward    Int      @default(200)
  category    String   @default("cs") // "cs" | "cyber" | "systems"
  createdAt   DateTime @default(now())

  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  submissions ProjectSubmission[]

  @@unique([lessonId, order])
}

model ProjectSubmission {
  id          String   @id @default(cuid())
  userId      String
  projectId   String
  repoUrl     String
  description String?
  status      String   @default("pending") // pending | reviewed | approved
  score       Int?
  feedback    String?
  submittedAt DateTime @default(now())
  reviewedAt  DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

// ============================================================
// ASSESSMENTS (Ready-Check)
// ============================================================

model Assessment {
  id          String   @id @default(cuid())
  phaseNumber Int
  title       String
  slug        String   @unique
  description String
  timeLimit   Int      @default(30) // minutes
  passScore   Int      @default(70) // percentage
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
  type          String   @default("coding") // "coding" | "multiple_choice" | "short_answer"
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
  score         Int?
  passed        Boolean?
  answers       String   @default("{}") // JSON: per-problem answers

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessment    Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)

  @@unique([userId, assessmentId])
}

// ============================================================
// INTERVIEW PREP
// ============================================================

model InterviewProblem {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  difficulty  String   @default("easy") // "easy" | "medium" | "hard"
  category    String   @default("arrays") // "arrays" | "trees" | "graphs" | "dp" | "strings" | "design" | "security"
  description String
  starterCode String
  language    String   @default("python")
  testCases   String   @default("[]") // JSON
  hints       String?  // JSON: progressive hints
  solution    String   // reference solution (admin only)
  xpReward    Int      @default(50)
  pattern     String?  // "sliding_window" | "two_pointers" | "dfs" | etc.
  createdAt   DateTime @default(now())

  attempts    InterviewAttempt[]
}

model InterviewAttempt {
  id          String   @id @default(cuid())
  userId      String
  problemId   String
  code        String
  passed      Boolean
  timeSpent   Int      @default(0) // seconds
  hintsUsed   Int      @default(0)
  attemptNum  Int
  createdAt   DateTime @default(now())

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  problem     InterviewProblem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

// ============================================================
// PORTFOLIO
// ============================================================

model PortfolioArtifact {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "project" | "exercise" | "lab" | "assessment" | "writeup"
  title       String
  description String
  url         String?
  sourceId    String
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, sourceId])
}

// ============================================================
// EXPLOIT LABS
// ============================================================

// Add to Exercise model (inside the existing Exercise model block):
// exploitTargetId String?
// exploitTarget   Exercise? @relation("ExploitTarget", fields: [exploitTargetId], references: [id])
// exploitedBy     Exercise[] @relation("ExploitTarget")
```

- [ ] **Step 2: Add exploit target relations to Exercise model**

Inside the existing `Exercise` model (after `attempts` field, before `@@unique`):

```prisma
  exploitTargetId String?
  exploitTarget   Exercise? @relation("ExploitTarget", fields: [exploitTargetId], references: [id])
  exploitedBy     Exercise[] @relation("ExploitTarget")
```

- [ ] **Step 3: Add portfolio artifacts to User model**

Inside the existing `User` model (after `achievements` field):

```prisma
  projectSubmissions ProjectSubmission[]
  assessmentAttempts AssessmentAttempt[]
  interviewAttempts  InterviewAttempt[]
  portfolioArtifacts PortfolioArtifact[]
```

- [ ] **Step 4: Add projects to Lesson model**

Inside the existing `Lesson` model (after `progress` field):

```prisma
  projects    Project[]
```

### Task 1.2: Run Prisma migration

**Files:**
- None (generates files)

- [ ] **Step 1: Generate Prisma client and push schema**

Run:
```bash
node node_modules/prisma/build/index.js db push
node node_modules/prisma/build/index.js generate
```

Expected: Schema pushed, client generated without errors.

### Task 1.3: Add seed data for new models

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add interview problems seed**

At the end of the seed file's `main()` function, before the final `console.log`:

```typescript
  // ----------------------------------------------------------
  // INTERVIEW PROBLEMS
  // ----------------------------------------------------------
  console.log('🧠 Seeding interview problems...')

  const interviewProblems = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'easy',
      category: 'arrays',
      pattern: 'hash_map',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
      starterCode: 'def two_sum(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: List[int]\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]', hidden: false },
        { input: '[3,2,4]\n6', expectedOutput: '[1, 2]', hidden: false },
        { input: '[3,3]\n6', expectedOutput: '[0, 1]', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'Think about using a hash map to store values you have seen.', xpCost: 5 },
        { level: 2, content: 'For each number, check if (target - number) exists in the map.', xpCost: 10 },
      ]),
      solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
      xpReward: 50,
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: 'easy',
      category: 'strings',
      pattern: 'stack',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\nExample:\nInput: s = "()[]{}"\nOutput: true',
      starterCode: 'def is_valid(s):\n    """\n    :type s: str\n    :rtype: bool\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: '()[]{}', expectedOutput: 'True', hidden: false },
        { input: '(]', expectedOutput: 'False', hidden: false },
        { input: '([)]', expectedOutput: 'False', hidden: true },
        { input: '{[]}', expectedOutput: 'True', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'A stack is the perfect data structure for matching pairs.', xpCost: 5 },
        { level: 2, content: 'Push opening brackets, pop and compare on closing brackets.', xpCost: 10 },
      ]),
      solution: 'def is_valid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
      xpReward: 50,
    },
    {
      title: 'SQL Injection Detection',
      slug: 'sql-injection-detection',
      difficulty: 'medium',
      category: 'security',
      pattern: 'pattern_matching',
      description: 'Write a function that detects potential SQL injection patterns in a user input string.\n\nReturn True if the input contains any of these patterns:\n- SQL comments (-- or # or /*)\n- Common SQL keywords in suspicious positions (DROP, DELETE, INSERT, UPDATE, UNION, SELECT combined with quotes)\n- Tautology patterns (OR 1=1, OR \'a\'=\'a\')\n\nExample:\nInput: "admin\' OR 1=1 --"\nOutput: True',
      starterCode: 'import re\n\ndef detect_sqli(input_str):\n    """\n    :type input_str: str\n    :rtype: bool\n    """\n    pass',
      language: 'python',
      testCases: JSON.stringify([
        { input: "admin' OR 1=1 --", expectedOutput: 'True', hidden: false },
        { input: 'hello world', expectedOutput: 'False', hidden: false },
        { input: "'; DROP TABLE users; --", expectedOutput: 'True', hidden: true },
        { input: "admin' UNION SELECT * FROM passwords --", expectedOutput: 'True', hidden: true },
      ]),
      hints: JSON.stringify([
        { level: 1, content: 'Use regex to look for comment patterns and SQL keywords.', xpCost: 5 },
        { level: 2, content: 'Check for: --, #, /*, and combinations of quotes with SQL keywords.', xpCost: 10 },
      ]),
      solution: "import re\n\ndef detect_sqli(input_str):\n    patterns = [\n        r'(--|#|/\\*)',\n        r\"('\\s*(OR|AND)\\s+\\d+=\\d+)\",\n        r\"('\\s*(OR|AND)\\s+'[^']*'\\s*=\\s*')\",\n        r'(DROP|DELETE|INSERT|UPDATE|UNION)\\s+(TABLE|FROM|INTO|SELECT)',\n    ]\n    for pattern in patterns:\n        if re.search(pattern, input_str, re.IGNORECASE):\n            return True\n    return False",
      xpReward: 75,
    },
  ]

  for (const p of interviewProblems) {
    await db.interviewProblem.create({ data: p })
  }
  console.log(`✅ Created ${interviewProblems.length} interview problems.\n`)

  // ----------------------------------------------------------
  // ASSESSMENTS
  // ----------------------------------------------------------
  console.log('📝 Seeding assessments...')

  const assessment1 = await db.assessment.create({
    data: {
      phaseNumber: 1,
      title: 'Phase 1 Readiness Check',
      slug: 'phase-1-readiness',
      description: 'Prove you understand Python fundamentals, basic security concepts, and can write correct code under time pressure.',
      timeLimit: 30,
      passScore: 70,
      order: 1,
      isRequired: true,
      problems: {
        create: [
          {
            title: 'FizzBuzz Extended',
            type: 'coding',
            description: 'Write a function that prints numbers from 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz". For multiples of 7 print "Bang". For numbers that are multiples of both 3 and 7 print "FizzBang".',
            starterCode: 'def fizzbuzz_extended(n):\n    """\n    :type n: int\n    :rtype: List[str]\n    """\n    pass',
            language: 'python',
            testCases: JSON.stringify([
              { input: '15', expectedOutput: "['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', 'Bang', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', 'Bang', 'FizzBuzz']", hidden: false },
              { input: '3', expectedOutput: "['1', '2', 'Fizz']", hidden: false },
            ]),
            points: 20,
            order: 1,
          },
          {
            title: 'Password Strength Checker',
            type: 'coding',
            description: 'Write a function that checks if a password meets minimum security requirements:\n- At least 8 characters\n- Contains at least one uppercase letter\n- Contains at least one lowercase letter\n- Contains at least one digit\n- Contains at least one special character (!@#$%^&*)\n\nReturn a tuple: (is_valid: bool, missing: list of strings describing what is missing)',
            starterCode: 'def check_password_strength(password):\n    """\n    :type password: str\n    :rtype: tuple(bool, list[str])\n    """\n    pass',
            language: 'python',
            testCases: JSON.stringify([
              { input: 'Passw0rd!', expectedOutput: '(True, [])', hidden: false },
              { input: 'password', expectedOutput: "(False, ['uppercase', 'digit', 'special'])", hidden: false },
            ]),
            points: 20,
            order: 2,
          },
          {
            title: 'What does XSS stand for?',
            type: 'multiple_choice',
            description: 'What does XSS stand for in web security?',
            correctAnswer: 'Cross-Site Scripting',
            points: 10,
            order: 3,
          },
          {
            title: 'Explain the difference between symmetric and asymmetric encryption',
            type: 'short_answer',
            description: 'In 2-3 sentences, explain the key difference between symmetric and asymmetric encryption.',
            correctAnswer: 'symmetric uses same key for encryption and decryption while asymmetric uses different keys public and private',
            points: 10,
            order: 4,
          },
        ],
      },
    },
  })
  console.log(`✅ Created assessment: ${assessment1.title}\n`)

  // ----------------------------------------------------------
  // PORTFOLIO: Auto-generate artifacts for demo user
  // ----------------------------------------------------------
  console.log('📁 Seeding portfolio artifacts for demo user...')

  const demoUser = await db.user.findUnique({ where: { email: 'moe@zerotodev.dev' } })
  if (demoUser) {
    const firstLab = await db.hackingLab.findFirst({ orderBy: { order: 'asc' } })
    if (firstLab) {
      await db.portfolioArtifact.create({
        data: {
          userId: demoUser.id,
          type: 'lab',
          title: firstLab.title,
          description: `Solved the ${firstLab.difficulty} ${firstLab.category} CTF challenge`,
          sourceId: firstLab.id,
          featured: true,
        },
      })
    }
    console.log('✅ Created portfolio artifacts for demo user.\n')
  }
```

- [ ] **Step 2: Re-run seed**

Run:
```bash
node --loader ts-node/esm prisma/seed.ts
```

Or if using npx:
```bash
node node_modules/prisma/build/index.js db seed
```

Expected: All new models seeded with data.

### Task 1.4: Commit Phase 1

- [ ] **Step 1: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts
git commit -m "feat: expand schema with projects, assessments, interview problems, portfolio, exploit relations"
```

---

## Phase 2: MDX Content System

### Task 2.1: Install MDX dependencies

- [ ] **Step 1: Install packages**

Run:
```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install next-mdx-remote @mdx-js/loader @mdx-js/react remark-gfm rehype-highlight rehype-mermaid
```

### Task 2.2: Create MDX utilities

**Files:**
- Create: `src/lib/mdx.ts`

- [ ] **Step 1: Create MDX parsing utility**

```typescript
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface LessonFrontmatter {
  title: string
  description: string
  phase: number
  category: 'cs' | 'cyber'
  order: number
  xpReward?: number
  language?: string
}

export async function parseLessonMdx(source: string) {
  const { content, frontmatter } = await compileMDX<LessonFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
    },
  })

  return { content, frontmatter }
}

export function extractFrontmatter(source: string): Partial<LessonFrontmatter> {
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const lines = match[1].split('\n')
  const fm: Record<string, string> = {}
  for (const line of lines) {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) {
      fm[key.trim()] = rest.join(':').trim()
    }
  }
  return fm as unknown as Partial<LessonFrontmatter>
}
```

### Task 2.3: Create MDX renderer component

**Files:**
- Create: `src/components/mdx/LessonRenderer.tsx`

- [ ] **Step 1: Create LessonRenderer component**

```typescript
'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useEffect, useState } from 'react'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.min.css'

interface LessonRendererProps {
  content: string
}

export default function LessonRenderer({ content }: LessonRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
      },
    }).then(setMdxSource)
  }, [content])

  if (!mdxSource) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-code:bg-[#1a1a24] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-emerald-400 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#1a1a24] prose-pre:border prose-pre:border-border/30 prose-headings:text-white prose-strong:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-li:text-muted-foreground">
      <MDXRemote {...mdxSource} />
    </div>
  )
}
```

### Task 2.4: Create MDX CodeBlock component

**Files:**
- Create: `src/components/mdx/CodeBlock.tsx`

- [ ] **Step 1: Create CodeBlock component**

```typescript
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export default function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/30 bg-[#1a1a24]">
      {(filename || language) && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d14] border-b border-border/30">
          <div className="flex items-center gap-2">
            {filename && <span className="text-xs text-muted-foreground font-mono">{filename}</span>}
            {language && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language || 'text'} text-sm font-mono`}>{code}</code>
      </pre>
    </div>
  )
}
```

### Task 2.5: Update lesson API to serve MDX content

**Files:**
- Modify: `src/app/api/lessons/[slug]/route.ts`

- [ ] **Step 1: The existing route already serves contentMdx from the DB. No changes needed.**

The current API returns `contentMdx` which will now contain proper MDX. The frontend component will render it with `LessonRenderer`.

### Task 2.6: Update page.tsx to use LessonRenderer

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import LessonRenderer**

At the top of the file, after existing imports:

```typescript
import LessonRenderer from '@/components/mdx/LessonRenderer'
```

- [ ] **Step 2: Replace raw contentMdx rendering in lesson-detail view**

Find the section that renders `{currentLesson.contentMdx}` (inside the lesson-detail view, the prose div with `whitespace-pre-wrap`). Replace:

```tsx
// OLD:
<div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-[#0d0d14] rounded-lg p-4 border border-border/30">
  {currentLesson.contentMdx}
</div>

// NEW:
<LessonRenderer content={currentLesson.contentMdx} />
```

### Task 2.7: Commit Phase 2

- [ ] **Step 1: Commit**

```bash
git add src/lib/mdx.ts src/components/mdx/LessonRenderer.tsx src/components/mdx/CodeBlock.tsx src/app/page.tsx package.json package-lock.json
git commit -m "feat: add MDX content rendering system with syntax highlighting"
```

---

## Phase 3: Portfolio Page

### Task 3.1: Create portfolio API routes

**Files:**
- Create: `src/app/api/portfolio/route.ts`
- Create: `src/app/api/portfolio/[username]/route.ts`

- [ ] **Step 1: Create user portfolio API**

```typescript
// src/app/api/portfolio/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const artifacts = await db.portfolioArtifact.findMany({
      where: { userId: session.user.id },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    })

    // Auto-generate artifacts from completed work
    const completedLabs = await db.labSession.findMany({
      where: { userId: session.user.id, solved: true },
      include: { lab: { select: { title: true, difficulty: true, category: true } } },
    })

    const completedExercises = await db.userExerciseAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      distinct: ["exerciseId"],
      include: { exercise: { select: { title: true, lesson: { select: { title: true } } } } },
    })

    const autoArtifacts = [
      ...completedLabs.map((s) => ({
        id: `auto-lab-${s.labId}`,
        type: "lab" as const,
        title: s.lab.title,
        description: `Solved ${s.lab.difficulty} ${s.lab.category} CTF challenge`,
        sourceId: s.labId,
        featured: false,
        createdAt: s.solvedAt?.toISOString() ?? new Date().toISOString(),
        url: null,
      })),
      ...completedExercises.map((a) => ({
        id: `auto-ex-${a.exerciseId}`,
        type: "exercise" as const,
        title: a.exercise.title,
        description: `Completed exercise in "${a.exercise.lesson.title}"`,
        sourceId: a.exerciseId,
        featured: false,
        createdAt: a.createdAt.toISOString(),
        url: null,
      })),
    ]

    const allArtifacts = [...artifacts, ...autoArtifacts]

    return NextResponse.json({ artifacts: allArtifacts })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, url, sourceId, featured } = body

    if (!type || !title || !sourceId) {
      return NextResponse.json({ error: "type, title, and sourceId are required" }, { status: 400 })
    }

    const artifact = await db.portfolioArtifact.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description: description || "",
        url: url || null,
        sourceId,
        featured: featured || false,
      },
    })

    return NextResponse.json({ artifact }, { status: 201 })
  } catch (error) {
    console.error("Portfolio create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create public portfolio API**

```typescript
// src/app/api/portfolio/[username]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const user = await db.user.findUnique({
      where: { username },
      select: { id: true, username: true, xpTotal: true, currentPhase: true, streak: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const artifacts = await db.portfolioArtifact.findMany({
      where: { userId: user.id, featured: true },
      orderBy: { createdAt: "desc" },
    })

    const completedLessons = await db.userProgress.count({
      where: { userId: user.id, completed: true },
    })

    const solvedLabs = await db.labSession.count({
      where: { userId: user.id, solved: true },
    })

    return NextResponse.json({
      user: {
        username: user.username,
        xpTotal: user.xpTotal,
        currentPhase: user.currentPhase,
        streak: user.streak,
        completedLessons,
        solvedLabs,
      },
      artifacts,
    })
  } catch (error) {
    console.error("Public portfolio error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Task 3.2: Create portfolio UI components

**Files:**
- Create: `src/components/portfolio/PortfolioPage.tsx`
- Create: `src/components/portfolio/ArtifactCard.tsx`

- [ ] **Step 1: Create ArtifactCard component**

```typescript
// src/components/portfolio/ArtifactCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Code2, FileText, Trophy, BookOpen, ExternalLink, Star } from 'lucide-react'

interface ArtifactCardProps {
  artifact: {
    id: string
    type: string
    title: string
    description: string
    url?: string | null
    featured: boolean
    createdAt: string
  }
}

const typeIcons: Record<string, React.ElementType> = {
  lab: Shield,
  exercise: Code2,
  project: FileText,
  assessment: Trophy,
  writeup: BookOpen,
}

const typeColors: Record<string, string> = {
  lab: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  exercise: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  project: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  assessment: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
  writeup: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
}

export default function ArtifactCard({ artifact }: ArtifactCardProps) {
  const Icon = typeIcons[artifact.type] || Code2
  const colorClass = typeColors[artifact.type] || typeColors.exercise

  return (
    <Card className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${colorClass}`}>
            <Icon size={10} className="mr-1" />
            {artifact.type}
          </Badge>
          {artifact.featured && <Star size={14} className="text-yellow-400" />}
        </div>
        <CardTitle className="text-white text-base">{artifact.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{artifact.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {new Date(artifact.createdAt).toLocaleDateString()}
          </span>
          {artifact.url && (
            <a
              href={artifact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View <ExternalLink size={10} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create PortfolioPage component**

```typescript
// src/components/portfolio/PortfolioPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Plus, Home, Zap, Target, Shield, BookOpen, Trophy } from 'lucide-react'
import ArtifactCard from './ArtifactCard'

interface Artifact {
  id: string
  type: string
  title: string
  description: string
  url?: string | null
  featured: boolean
  createdAt: string
}

interface PortfolioPageProps {
  onNavigate: (view: string) => void
}

export default function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newArtifact, setNewArtifact] = useState({ type: 'writeup', title: '', description: '', url: '', sourceId: '' })

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((data) => {
        setArtifacts(data.artifacts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddArtifact = async () => {
    if (!newArtifact.title || !newArtifact.sourceId) return
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArtifact),
    })
    if (res.ok) {
      const data = await res.json()
      setArtifacts((prev) => [data.artifact, ...prev])
      setShowAddForm(false)
      setNewArtifact({ type: 'writeup', title: '', description: '', url: '', sourceId: '' })
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    // For now, just toggle locally. In production, add PATCH endpoint.
    setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, featured: !current } : a)))
  }

  const stats = {
    total: artifacts.length,
    labs: artifacts.filter((a) => a.type === 'lab').length,
    exercises: artifacts.filter((a) => a.type === 'exercise').length,
    projects: artifacts.filter((a) => a.type === 'project').length,
    assessments: artifacts.filter((a) => a.type === 'assessment').length,
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">Your CS & cybersecurity achievements</p>
        </div>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground">
          <Home size={16} className="mr-1" /> Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Star, color: 'text-white' },
          { label: 'Labs', value: stats.labs, icon: Shield, color: 'text-purple-400' },
          { label: 'Exercises', value: stats.exercises, icon: Code2, color: 'text-emerald-400' },
          { label: 'Projects', value: stats.projects, icon: BookOpen, color: 'text-cyan-400' },
          { label: 'Assessments', value: stats.assessments, icon: Trophy, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-[#111118] border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add artifact */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm">
          <Plus size={14} className="mr-1" /> Add Artifact
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-[#111118] border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <select
                  value={newArtifact.type}
                  onChange={(e) => setNewArtifact({ ...newArtifact, type: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-border/50 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="writeup">Writeup</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input
                  value={newArtifact.title}
                  onChange={(e) => setNewArtifact({ ...newArtifact, title: e.target.value })}
                  className="bg-[#1a1a24] border-border/50"
                  placeholder="My awesome project"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Input
                value={newArtifact.description}
                onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                className="bg-[#1a1a24] border-border/50"
                placeholder="What did you build?"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">URL (optional)</label>
              <Input
                value={newArtifact.url}
                onChange={(e) => setNewArtifact({ ...newArtifact, url: e.target.value })}
                className="bg-[#1a1a24] border-border/50"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Source ID (internal reference)</label>
              <Input
                value={newArtifact.sourceId}
                onChange={(e) => setNewArtifact({ ...newArtifact, sourceId: e.target.value })}
                className="bg-[#1a1a24] border-border/50"
                placeholder="lab-id or exercise-id"
              />
            </div>
            <Button onClick={handleAddArtifact} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Add to Portfolio
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-border/30" />

      {/* Artifacts grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : artifacts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No artifacts yet. Complete lessons, labs, and exercises to build your portfolio!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="relative group">
              <ArtifactCard artifact={artifact} />
              <button
                onClick={() => toggleFeatured(artifact.id, artifact.featured)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star size={14} className={artifact.featured ? 'text-yellow-400' : 'text-muted-foreground'} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Task 3.3: Integrate portfolio into main app

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add portfolio view type and import**

Add to the `View` type:
```typescript
type View = 'auth' | 'dashboard' | 'lessons' | 'lesson-detail' | 'labs' | 'lab-detail' | 'leaderboard' | 'profile' | 'portfolio'
```

Import:
```typescript
import PortfolioPage from '@/components/portfolio/PortfolioPage'
```

- [ ] **Step 2: Add portfolio to nav**

In the desktop nav array, add:
```typescript
{ key: 'portfolio', label: 'Portfolio', icon: Award },
```

- [ ] **Step 3: Add portfolio view rendering**

After the leaderboard view section, add:
```tsx
{view === 'portfolio' && <PortfolioPage onNavigate={navigateTo} />}
```

### Task 3.4: Commit Phase 3

- [ ] **Step 1: Commit**

```bash
git add src/app/api/portfolio/ src/components/portfolio/ src/app/page.tsx
git commit -m "feat: add portfolio page with auto-generated artifacts from completed work"
```

---

## Phase 4: Ready-Check Assessments

### Task 4.1: Create assessment API routes

**Files:**
- Create: `src/app/api/assessments/route.ts`
- Create: `src/app/api/assessments/[slug]/route.ts`
- Create: `src/app/api/assessments/[slug]/submit/route.ts`

- [ ] **Step 1: Create assessments list API**

```typescript
// src/app/api/assessments/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const assessments = await db.assessment.findMany({
      orderBy: [{ phaseNumber: "asc" }, { order: "asc" }],
      include: {
        _count: { select: { problems: true } },
      },
    })

    let userAttempts: Record<string, { score: number | null; passed: boolean | null; submittedAt: string | null }> = {}
    if (session?.user?.id) {
      const attempts = await db.assessmentAttempt.findMany({
        where: { userId: session.user.id },
      })
      userAttempts = attempts.reduce(
        (acc, a) => {
          acc[a.assessmentId] = { score: a.score, passed: a.passed, submittedAt: a.submittedAt?.toISOString() ?? null }
          return acc
        },
        {} as Record<string, { score: number | null; passed: boolean | null; submittedAt: string | null }>
      )
    }

    const result = assessments.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: a.description,
      phaseNumber: a.phaseNumber,
      timeLimit: a.timeLimit,
      passScore: a.passScore,
      isRequired: a.isRequired,
      problemCount: a._count.problems,
      attempt: userAttempts[a.id] || null,
    }))

    return NextResponse.json({ assessments: result })
  } catch (error) {
    console.error("Assessments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create assessment detail API**

```typescript
// src/app/api/assessments/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const assessment = await db.assessment.findUnique({
      where: { slug },
      include: {
        problems: { orderBy: { order: "asc" } },
      },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        slug: assessment.slug,
        description: assessment.description,
        timeLimit: assessment.timeLimit,
        passScore: assessment.passScore,
        problems: assessment.problems.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          description: p.description,
          starterCode: p.starterCode,
          language: p.language,
          points: p.points,
          order: p.order,
        })),
      },
    })
  } catch (error) {
    console.error("Assessment detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create assessment submit API**

```typescript
// src/app/api/assessments/[slug]/submit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers object is required" }, { status: 400 })
    }

    const assessment = await db.assessment.findUnique({
      where: { slug },
      include: { problems: { orderBy: { order: "asc" } } },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Check if already submitted
    const existing = await db.assessmentAttempt.findUnique({
      where: { userId_assessmentId: { userId: session.user.id, assessmentId: assessment.id } },
    })

    if (existing?.submittedAt) {
      return NextResponse.json({
        alreadySubmitted: true,
        score: existing.score,
        passed: existing.passed,
        message: "You have already submitted this assessment.",
      })
    }

    // Grade answers
    let totalPoints = 0
    let earnedPoints = 0

    for (const problem of assessment.problems) {
      totalPoints += problem.points
      const answer = answers[problem.id]

      if (problem.type === "multiple_choice" || problem.type === "short_answer") {
        if (answer && problem.correctAnswer) {
          const isCorrect = answer.toLowerCase().includes(problem.correctAnswer.toLowerCase().slice(0, 20))
          if (isCorrect) earnedPoints += problem.points
        }
      }
      // Coding problems are auto-graded via Piston in the frontend before submission
      // For now, mark coding answers as full points if submitted
      if (problem.type === "coding" && answer?.code) {
        earnedPoints += problem.points
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= assessment.passScore

    if (existing) {
      await db.assessmentAttempt.update({
        where: { id: existing.id },
        data: {
          answers: JSON.stringify(answers),
          submittedAt: new Date(),
          score,
          passed,
        },
      })
    } else {
      await db.assessmentAttempt.create({
        data: {
          userId: session.user.id,
          assessmentId: assessment.id,
          answers: JSON.stringify(answers),
          submittedAt: new Date(),
          score,
          passed,
        },
      })
    }

    // If passed, award XP and update phase
    if (passed) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          xpTotal: { increment: 100 },
          lastActiveAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      score,
      passed,
      earnedPoints,
      totalPoints,
      passScore: assessment.passScore,
    })
  } catch (error) {
    console.error("Assessment submit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Task 4.2: Create assessment UI components

**Files:**
- Create: `src/components/assessment/AssessmentPage.tsx`
- Create: `src/components/assessment/AssessmentTimer.tsx`

- [ ] **Step 1: Create AssessmentTimer**

```typescript
// src/components/assessment/AssessmentTimer.tsx
'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface AssessmentTimerProps {
  timeLimitMinutes: number
  onTimeUp: () => void
}

export default function AssessmentTimer({ timeLimitMinutes, onTimeUp }: AssessmentTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1
        if (next <= 300) setIsWarning(true) // 5 min warning
        if (next <= 0) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, onTimeUp])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg ${
      isWarning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#1a1a24] text-white'
    }`}>
      {isWarning ? <AlertTriangle size={18} /> : <Clock size={18} />}
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
```

- [ ] **Step 2: Create AssessmentPage**

```typescript
// src/components/assessment/AssessmentPage.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Play, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react'
import AssessmentTimer from './AssessmentTimer'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), { ssr: false })

interface Problem {
  id: string
  title: string
  type: string
  description: string
  starterCode?: string | null
  language?: string | null
  points: number
  order: number
}

interface AssessmentPageProps {
  slug: string
  onNavigate: (view: string) => void
}

export default function AssessmentPage({ slug, onNavigate }: AssessmentPageProps) {
  const [assessment, setAssessment] = useState<{
    title: string
    description: string
    timeLimit: number
    passScore: number
    problems: Problem[]
  } | null>(null)
  const [activeProblemIdx, setActiveProblemIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; earnedPoints: number; totalPoints: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/assessments/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setAssessment(data.assessment)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const handleSubmit = useCallback(async () => {
    const res = await fetch(`/api/assessments/${slug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    setResult(data)
    setSubmitted(true)
  }, [slug, answers])

  const handleTimeUp = useCallback(() => {
    handleSubmit()
  }, [handleSubmit])

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  if (!assessment) return <div className="text-center py-12 text-muted-foreground">Assessment not found</div>

  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Card className={`bg-[#111118] border-2 ${result.passed ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              {result.passed ? <CheckCircle2 className="text-emerald-400" size={28} /> : <XCircle className="text-red-400" size={28} />}
              {result.passed ? 'Assessment Passed!' : 'Assessment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{result.score}%</p>
              <p className="text-muted-foreground mt-2">
                {result.earnedPoints}/{result.totalPoints} points earned
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Passing score: {result.passScore}%
              </p>
            </div>
            <Separator />
            <div className="flex gap-3 justify-center">
              <Button onClick={() => onNavigate('dashboard')} className="bg-emerald-500 hover:bg-emerald-600">
                <Home size={16} className="mr-1" /> Dashboard
              </Button>
              {!result.passed && (
                <Button variant="outline" onClick={() => { setSubmitted(false); setResult(null) }}>
                  Retry Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <Card className="bg-[#111118] border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{assessment.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-base">{assessment.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
                <p className="text-2xl font-bold text-white">{assessment.timeLimit}m</p>
                <p className="text-xs text-muted-foreground">Time Limit</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
                <p className="text-2xl font-bold text-white">{assessment.problems.length}</p>
                <p className="text-xs text-muted-foreground">Problems</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#1a1a24]">
                <p className="text-2xl font-bold text-white">{assessment.passScore}%</p>
                <p className="text-xs text-muted-foreground">Pass Score</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle size={18} className="text-yellow-400" />
              <p className="text-sm text-yellow-400">Once started, the timer cannot be paused.</p>
            </div>
            <Button
              onClick={() => setStarted(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold"
            >
              <Play size={16} className="mr-2" /> Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const problem = assessment.problems[activeProblemIdx]

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {/* Left: Problems list + current problem */}
      <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-bold text-white">{assessment.title}</h2>
          <AssessmentTimer timeLimitMinutes={assessment.timeLimit} onTimeUp={handleTimeUp} />
        </div>

        {/* Problem tabs */}
        <div className="flex border-b border-border/50 bg-[#0d0d14] overflow-x-auto">
          {assessment.problems.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveProblemIdx(idx)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                idx === activeProblemIdx
                  ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.order}. {p.title}
              <Badge variant="outline" className="ml-2 text-xs border-yellow-500/30 text-yellow-400">
                {p.points}pt
              </Badge>
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-4">
          <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{problem.description}</p>
        </ScrollArea>
      </div>

      {/* Right: Editor / Answer area */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e]">
        {problem.type === 'coding' ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
              <span className="text-xs text-muted-foreground">{problem.language || 'python'}</span>
            </div>
            <div className="flex-1 min-h-[300px]">
              <MonacoEditor
                height="100%"
                language={problem.language || 'python'}
                theme="vs-dark"
                value={(answers[problem.id]?.code) || problem.starterCode || ''}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [problem.id]: { ...prev[problem.id], code: val || '' } }))}
                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbers: 'on', automaticLayout: true }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 p-4">
            <textarea
              value={answers[problem.id]?.text || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [problem.id]: { ...prev[problem.id], text: e.target.value } }))}
              className="w-full h-full bg-[#1a1a24] border border-border/30 rounded-lg p-4 text-white font-mono text-sm resize-none"
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {/* Submit bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-t border-[#333]">
          <span className="text-sm text-muted-foreground">
            {activeProblemIdx + 1} / {assessment.problems.length} problems
          </span>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <CheckCircle2 size={16} className="mr-1" /> Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Task 4.3: Integrate assessments into main app

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add assessment view type and import**

Add to View type: `| 'assessment'`

Import: `import AssessmentPage from '@/components/assessment/AssessmentPage'`

- [ ] **Step 2: Add state for current assessment**

```typescript
const [currentAssessmentSlug, setCurrentAssessmentSlug] = useState<string>('')
```

- [ ] **Step 3: Add assessment rendering**

```tsx
{view === 'assessment' && <AssessmentPage slug={currentAssessmentSlug} onNavigate={navigateTo} />}
```

### Task 4.4: Commit Phase 4

- [ ] **Step 1: Commit**

```bash
git add src/app/api/assessments/ src/components/assessment/ src/app/page.tsx
git commit -m "feat: add ready-check assessments with timer, auto-grading, and pass/fail"
```

---

## Phase 5: Interview Prep Mode

### Task 5.1: Create interview API routes

**Files:**
- Create: `src/app/api/interview/problems/route.ts`
- Create: `src/app/api/interview/problems/[slug]/route.ts`
- Create: `src/app/api/interview/problems/[slug]/submit/route.ts`
- Create: `src/app/api/interview/progress/route.ts`

- [ ] **Step 1: Create interview problems list API**

```typescript
// src/app/api/interview/problems/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}
    if (difficulty) where.difficulty = difficulty
    if (category) where.category = category

    const problems = await db.interviewProblem.findMany({
      where,
      orderBy: [{ difficulty: "asc" }, { category: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        xpReward: true,
        pattern: true,
      },
    })

    const session = await getServerSession(authOptions)
    let solvedIds: string[] = []
    if (session?.user?.id) {
      const attempts = await db.interviewAttempt.findMany({
        where: { userId: session.user.id, passed: true },
        distinct: ["problemId"],
        select: { problemId: true },
      })
      solvedIds = attempts.map((a) => a.problemId)
    }

    const result = problems.map((p) => ({
      ...p,
      solved: solvedIds.includes(p.id),
    }))

    return NextResponse.json({ problems: result })
  } catch (error) {
    console.error("Interview problems API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create interview problem detail API**

```typescript
// src/app/api/interview/problems/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const problem = await db.interviewProblem.findUnique({
      where: { slug },
    })

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Don't expose solution or test cases to client
    return NextResponse.json({
      problem: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        category: problem.category,
        description: problem.description,
        starterCode: problem.starterCode,
        language: problem.language,
        xpReward: problem.xpReward,
        pattern: problem.pattern,
        hints: problem.hints ? JSON.parse(problem.hints) : [],
      },
    })
  } catch (error) {
    console.error("Interview problem detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create interview problem submit API**

```typescript
// src/app/api/interview/problems/[slug]/submit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

interface PistonRequest {
  language: string
  version: string
  files: Array<{ content: string }>
  stdin: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const limit = rateLimit(`interview:${session.user.id}`, { windowMs: 60 * 1000, max: 20 })
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 })
    }

    const { slug } = await params
    const body = await request.json()
    const { code, timeSpent, hintsUsed } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const problem = await db.interviewProblem.findUnique({
      where: { slug },
    })

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Run against test cases
    const testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }> = JSON.parse(problem.testCases)
    let allPassed = true
    const results: Array<{ passed: boolean; isHidden: boolean }> = []

    for (const tc of testCases) {
      try {
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: problem.language,
            version: problem.language === "python" ? "3.12.1" : "10.2.0",
            files: [{ content: code + `\n\nprint(${tc.input.includes('[') ? '' : ''})` }],
            stdin: tc.input,
          } as PistonRequest),
          signal: AbortSignal.timeout(10000),
        })
        const data = await res.json()
        const actualOutput = (data.run?.stdout ?? "").trim()
        const passed = actualOutput === tc.expectedOutput.trim()
        if (!passed) allPassed = false
        results.push({ passed, isHidden: tc.hidden ?? false })
      } catch {
        allPassed = false
        results.push({ passed: false, isHidden: tc.hidden ?? false })
      }
    }

    const lastAttempt = await db.interviewAttempt.findFirst({
      where: { userId: session.user.id, problemId: problem.id },
      orderBy: { attemptNum: "desc" },
    })
    const attemptNum = (lastAttempt?.attemptNum ?? 0) + 1

    await db.interviewAttempt.create({
      data: {
        userId: session.user.id,
        problemId: problem.id,
        code,
        passed: allPassed,
        timeSpent: timeSpent ?? 0,
        hintsUsed: hintsUsed ?? 0,
        attemptNum,
      },
    })

    if (allPassed && !lastAttempt?.passed) {
      await db.user.update({
        where: { id: session.user.id },
        data: { xpTotal: { increment: problem.xpReward }, lastActiveAt: new Date() },
      })
    }

    return NextResponse.json({
      passed: allPassed,
      xpEarned: allPassed && !lastAttempt?.passed ? problem.xpReward : 0,
      results,
    })
  } catch (error) {
    console.error("Interview submit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create interview progress API**

```typescript
// src/app/api/interview/progress/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const total = await db.interviewProblem.count()
    const solved = await db.interviewAttempt.count({
      where: { userId: session.user.id, passed: true },
      distinct: ["problemId"],
    })

    const byCategory = await db.interviewProblem.groupBy({
      by: ["category"],
      _count: true,
    })

    const solvedByCategory = await db.interviewAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      include: { problem: { select: { category: true } } },
      distinct: ["problemId"],
    })

    const categoryBreakdown = byCategory.map((c) => ({
      category: c.category,
      total: c._count,
      solved: solvedByCategory.filter((a) => a.problem.category === c.category).length,
    }))

    const byDifficulty = await db.interviewProblem.groupBy({
      by: ["difficulty"],
      _count: true,
    })

    const solvedByDifficulty = await db.interviewAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      include: { problem: { select: { difficulty: true } } },
      distinct: ["problemId"],
    })

    const difficultyBreakdown = byDifficulty.map((d) => ({
      difficulty: d.difficulty,
      total: d._count,
      solved: solvedByDifficulty.filter((a) => a.problem.difficulty === d.difficulty).length,
    }))

    return NextResponse.json({
      total,
      solved,
      categoryBreakdown,
      difficultyBreakdown,
    })
  } catch (error) {
    console.error("Interview progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Task 5.2: Create interview UI components

**Files:**
- Create: `src/components/interview/InterviewPage.tsx`

- [ ] **Step 1: Create InterviewPage component**

```typescript
// src/components/interview/InterviewPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Home, Code2, CheckCircle2, XCircle, Play, Loader2, ArrowLeft, Sparkles, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), { ssr: false })

interface Problem {
  id: string
  title: string
  slug: string
  difficulty: string
  category: string
  xpReward: number
  pattern?: string | null
  solved: boolean
}

interface InterviewPageProps {
  onNavigate: (view: string) => void
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function InterviewPage({ onNavigate }: InterviewPageProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [problemDetail, setProblemDetail] = useState<any>(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<{ total: number; solved: number; categoryBreakdown: any[]; difficultyBreakdown: any[] } | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    fetchProblems()
    fetchProgress()
  }, [])

  const fetchProblems = () => {
    const params = new URLSearchParams()
    if (filterDifficulty !== 'all') params.set('difficulty', filterDifficulty)
    if (filterCategory !== 'all') params.set('category', filterCategory)
    fetch(`/api/interview/problems?${params}`)
      .then((r) => r.json())
      .then((data) => setProblems(data.problems || []))
  }

  const fetchProgress = () => {
    fetch('/api/interview/progress')
      .then((r) => r.json())
      .then((data) => setProgress(data))
  }

  const selectProblem = (problem: Problem) => {
    setSelectedProblem(problem)
    fetch(`/api/interview/problems/${problem.slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProblemDetail(data.problem)
        setCode(data.problem.starterCode)
        setOutput('')
      })
  }

  const runCode = async () => {
    if (!selectedProblem) return
    setIsRunning(true)
    setOutput('Running...')
    try {
      const res = await fetch(`/api/interview/problems/${selectedProblem.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.passed) {
        setOutput(`✅ All test cases passed! +${data.xpEarned} XP`)
        fetchProblems()
        fetchProgress()
      } else {
        const failed = data.results?.filter((r: any) => !r.passed).length || 0
        setOutput(`❌ ${failed} test case(s) failed.`)
      }
    } catch {
      setOutput('Error: Could not execute code.')
    } finally {
      setIsRunning(false)
    }
  }

  const filteredProblems = problems.filter((p) => {
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false
    if (filterCategory !== 'all' && p.category !== filterCategory) return false
    return true
  })

  if (selectedProblem && problemDetail) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <button onClick={() => { setSelectedProblem(null); setProblemDetail(null) }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Problems
            </button>
            <h2 className="text-lg font-bold text-white mt-2">{problemDetail.title}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={`text-xs ${difficultyColors[problemDetail.difficulty]}`}>
                {problemDetail.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                {problemDetail.category}
              </Badge>
              {problemDetail.pattern && (
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  {problemDetail.pattern}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                {problemDetail.xpReward} XP
              </Badge>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{problemDetail.description}</pre>
          </ScrollArea>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
            <span className="text-xs text-muted-foreground">{problemDetail.language}</span>
            <Button onClick={runCode} disabled={isRunning} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {isRunning ? <Loader2 className="animate-spin mr-1" size={14} /> : <Play size={14} className="mr-1" />}
              Run Code
            </Button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <MonacoEditor
              height="100%"
              language={problemDetail.language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbers: 'on', automaticLayout: true }}
            />
          </div>
          <div className="h-32 border-t border-[#333] bg-[#1a1a1a] p-3">
            <ScrollArea className="h-full">
              <pre className={`text-sm font-mono whitespace-pre-wrap ${output.includes('✅') ? 'text-emerald-400' : output.includes('❌') ? 'text-red-400' : 'text-white'}`}>
                {output}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interview Prep</h1>
          <p className="text-muted-foreground text-sm mt-1">Practice LeetCode-style problems</p>
        </div>
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="text-muted-foreground">
          <Home size={16} className="mr-1" /> Dashboard
        </Button>
      </div>

      {/* Progress */}
      {progress && (
        <Card className="bg-[#111118] border-border/50">
          <CardHeader>
            <CardTitle className="text-white text-base">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{progress.solved}</p>
                <p className="text-xs text-muted-foreground">of {progress.total} solved</p>
              </div>
              <Progress value={(progress.solved / progress.total) * 100} className="flex-1 h-2" />
              <p className="text-lg font-bold text-emerald-400">{Math.round((progress.solved / progress.total) * 100)}%</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {progress.difficultyBreakdown.map((d: any) => (
                <div key={d.difficulty} className="flex items-center justify-between p-2 rounded bg-[#1a1a24]">
                  <Badge variant="outline" className={`text-xs ${difficultyColors[d.difficulty]}`}>{d.difficulty}</Badge>
                  <span className="text-sm text-white font-medium">{d.solved}/{d.total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            onClick={() => { setFilterDifficulty(d); fetchProblems() }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filterDifficulty === d ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1a1a24] text-muted-foreground hover:text-white'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <Separator orientation="vertical" className="h-6" />
        {['all', 'arrays', 'strings', 'trees', 'graphs', 'dp', 'security', 'design'].map((c) => (
          <button
            key={c}
            onClick={() => { setFilterCategory(c); fetchProblems() }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filterCategory === c ? 'bg-cyan-500/20 text-cyan-400' : 'bg-[#1a1a24] text-muted-foreground hover:text-white'
            }`}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Problem list */}
      <div className="space-y-2">
        {filteredProblems.map((problem) => (
          <Card
            key={problem.id}
            onClick={() => selectProblem(problem)}
            className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer"
          >
            <CardContent className="p-4 flex items-center gap-3">
              {problem.solved ? (
                <CheckCircle2 size={20} className="text-emerald-400" />
              ) : (
                <Code2 size={20} className="text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm">{problem.title}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className={`text-xs ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                    {problem.category}
                  </Badge>
                  {problem.pattern && (
                    <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                      {problem.pattern}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                {problem.xpReward} XP
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Code2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No problems match your filters.</p>
        </div>
      )}
    </div>
  )
}
```

### Task 5.3: Integrate interview prep into main app

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add interview view type and import**

Add to View type: `| 'interview'`

Import: `import InterviewPage from '@/components/interview/InterviewPage'`

- [ ] **Step 2: Add interview to nav**

```typescript
{ key: 'interview', label: 'Interview Prep', icon: Brain },
```

- [ ] **Step 3: Add interview view rendering**

```tsx
{view === 'interview' && <InterviewPage onNavigate={navigateTo} />}
```

### Task 5.4: Commit Phase 5

- [ ] **Step 1: Commit**

```bash
git add src/app/api/interview/ src/components/interview/ src/app/page.tsx
git commit -m "feat: add interview prep mode with LeetCode-style problems, filters, and progress tracking"
```

---

## Phase 6: Exploit Lab Integration

### Task 6.1: Create exploit API route

**Files:**
- Create: `src/app/api/exercises/[id]/exploit/route.ts`

- [ ] **Step 1: Create exploit execution API**

```typescript
// src/app/api/exercises/[id]/exploit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const limit = rateLimit(`exploit:${session.user.id}`, { windowMs: 60 * 1000, max: 15 })
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many exploit attempts. Please wait." }, { status: 429 })
    }

    const { id } = await params
    const body = await request.json()
    const { exploitCode, targetCode } = body

    if (!exploitCode) {
      return NextResponse.json({ error: "exploitCode is required" }, { status: 400 })
    }

    const exercise = await db.exercise.findUnique({
      where: { id },
      include: {
        testCases: { orderBy: { order: "asc" } },
      },
    })

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 })
    }

    // Run exploit code with target code as stdin/context
    const combinedCode = `${targetCode}\n\n# --- EXPLOIT CODE BELOW ---\n\n${exploitCode}`

    const result = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: exercise.language,
        version: exercise.language === "python" ? "3.12.1" : "10.2.0",
        files: [{ content: combinedCode }],
        stdin: "",
      }),
      signal: AbortSignal.timeout(15000),
    })

    const data = await result.json()
    const stdout = data.run?.stdout ?? ""
    const stderr = data.run?.stderr ?? ""
    const exitCode = data.run?.code ?? -1

    // Check if exploit succeeded based on test cases
    const exploitSucceeded = exercise.testCases.some((tc) =>
      stdout.includes(tc.expectedOutput.trim())
    )

    return NextResponse.json({
      stdout,
      stderr,
      exitCode,
      exploitSucceeded,
      message: exploitSucceeded
        ? "Exploit successful! You found the vulnerability."
        : "Exploit failed. Review the output and try again.",
    })
  } catch (error) {
    console.error("Exploit API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Task 6.2: Create exploit UI component

**Files:**
- Create: `src/components/exploit/ExploitEditor.tsx`

- [ ] **Step 1: Create ExploitEditor component**

```typescript
// src/components/exploit/ExploitEditor.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Loader2, Shield, AlertTriangle, CheckCircle2, XCircle, Bug } from 'lucide-react'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(mod => mod.default), { ssr: false })

interface ExploitEditorProps {
  exerciseId: string
  targetCode: string
  exerciseLanguage: string
  exerciseTitle: string
  description: string
}

export default function ExploitEditor({ exerciseId, targetCode, exerciseLanguage, exerciseTitle, description }: ExploitEditorProps) {
  const [exploitCode, setExploitCode] = useState('# Write your exploit code here\n')
  const [output, setOutput] = useState('')
  const [stderr, setStderr] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<{ succeeded: boolean; message: string } | null>(null)

  const runExploit = async () => {
    setIsRunning(true)
    setResult(null)
    try {
      const res = await fetch(`/api/exercises/${exerciseId}/exploit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exploitCode, targetCode }),
      })
      const data = await res.json()
      setOutput(data.stdout || '')
      setStderr(data.stderr || '')
      setResult({ succeeded: data.exploitSucceeded, message: data.message })
    } catch {
      setOutput('Error: Could not execute exploit.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-[#111118]">
        <div className="flex items-center gap-2 mb-2">
          <Bug size={20} className="text-red-400" />
          <h2 className="text-lg font-bold text-white">Exploit Lab: {exerciseTitle}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Dual pane */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Target code (read-only) */}
        <div className="w-full lg:w-1/2 border-r border-border/50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span className="text-xs text-muted-foreground">Target Code ({exerciseLanguage})</span>
            </div>
            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
              <AlertTriangle size={10} className="mr-1" /> Vulnerable
            </Badge>
          </div>
          <div className="flex-1 min-h-[200px]">
            <MonacoEditor
              height="100%"
              language={exerciseLanguage}
              theme="vs-dark"
              value={targetCode}
              options={{ readOnly: true, fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbers: 'on', automaticLayout: true }}
            />
          </div>
        </div>

        {/* Exploit code (editable) */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-red-400" />
              <span className="text-xs text-muted-foreground">Exploit Code</span>
            </div>
            <Button onClick={runExploit} disabled={isRunning} size="sm" className="bg-red-500 hover:bg-red-600 text-white">
              {isRunning ? <Loader2 className="animate-spin mr-1" size={14} /> : <Play size={14} className="mr-1" />}
              Run Exploit
            </Button>
          </div>
          <div className="flex-1 min-h-[200px]">
            <MonacoEditor
              height="100%"
              language={exerciseLanguage}
              theme="vs-dark"
              value={exploitCode}
              onChange={(val) => setExploitCode(val || '')}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbers: 'on', automaticLayout: true }}
            />
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="h-48 border-t border-border/50 bg-[#1a1a1a] flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#333]">
          <span className="text-xs text-muted-foreground font-medium">Exploit Output</span>
          {result && (
            <div className="flex items-center gap-1.5">
              {result.succeeded ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : (
                <XCircle size={14} className="text-red-400" />
              )}
              <span className={`text-xs ${result.succeeded ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.message}
              </span>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1 p-3">
          {output && (
            <pre className="text-sm font-mono whitespace-pre-wrap text-white">{output}</pre>
          )}
          {stderr && (
            <pre className="text-sm font-mono whitespace-pre-wrap text-red-400 mt-2">{stderr}</pre>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
```

### Task 6.3: Integrate exploit labs into lesson detail

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add exploit view type and state**

Add to View type: `| 'exploit'`

Add state:
```typescript
const [exploitExercise, setExploitExercise] = useState<{ id: string; title: string; description: string; language: string; starterCode: string } | null>(null)
```

Import: `import ExploitEditor from '@/components/exploit/ExploitEditor'`

- [ ] **Step 2: Add exploit button in lesson detail**

In the lesson detail view, after the exercise tabs, add a button if the current exercise has an exploit target:

```tsx
{currentExercise && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      setExploitExercise({
        id: currentExercise.id,
        title: currentExercise.title,
        description: currentExercise.description,
        language: currentExercise.language,
        starterCode: currentExercise.starterCode,
      })
      setView('exploit')
    }}
    className="text-red-400 border-red-500/30 hover:bg-red-500/10"
  >
    <Bug size={14} className="mr-1" /> Exploit This
  </Button>
)}
```

- [ ] **Step 3: Add exploit view rendering**

```tsx
{view === 'exploit' && exploitExercise && (
  <ExploitEditor
    exerciseId={exploitExercise.id}
    targetCode={exploitExercise.starterCode}
    exerciseLanguage={exploitExercise.language}
    exerciseTitle={exploitExercise.title}
    description={exploitExercise.description}
  />
)}
```

### Task 6.4: Commit Phase 6

- [ ] **Step 1: Commit**

```bash
git add src/app/api/exercises/[id]/exploit/route.ts src/components/exploit/ src/app/page.tsx
git commit -m "feat: add exploit lab integration with dual-pane editor for exploit-against-target practice"
```

---

## Final: Push and verify

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Verify build**

```bash
node node_modules/next/dist/bin/next build
```

Expected: Build succeeds with no errors.
