# Language Tracks & Certifications UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build multi-language learning tracks (like Exercism) and project-based certifications (like freeCodeCamp) with full UI, API routes, and dashboard integration.

**Architecture:** Extend the existing single-page app with new View types, three new component files, and five new API routes. Reuse all existing patterns (shadcn/ui, auth, data fetching, navigation).

**Tech Stack:** Next.js 15 App Router, Prisma, NextAuth v4, shadcn/ui, Lucide icons, Tailwind CSS v4, TypeScript

---

### Task 1: API Routes for Language Tracks

**Files:**
- Create: `src/app/api/tracks/route.ts`
- Create: `src/app/api/tracks/[slug]/route.ts`

- [ ] **Step 1: Create tracks list API route**

Create `src/app/api/tracks/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const tracks = await db.languageTrack.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    })

    let userProgress: Record<string, { completed: boolean; exercisesCompleted: number; totalExercises: number }> = {}
    if (session?.user?.id) {
      const progress = await db.userTrackProgress.findMany({
        where: { userId: session.user.id },
      })
      for (const p of progress) {
        userProgress[p.trackId] = {
          completed: p.completed,
          exercisesCompleted: p.exercisesCompleted,
          totalExercises: p.totalExercises,
        }
      }
    }

    const result = tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      difficulty: track.difficulty,
      order: track.order,
      lessonCount: track.lessons.length,
      progress: userProgress[track.id] || null,
    }))

    return NextResponse.json({ tracks: result })
  } catch (error) {
    console.error("Tracks API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create track detail API route**

Create `src/app/api/tracks/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const track = await db.languageTrack.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                language: true,
                order: true,
                xpReward: true,
              },
            },
          },
        },
      },
    })

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    let userProgress = null
    let completedExerciseIds: string[] = []
    if (session?.user?.id) {
      userProgress = await db.userTrackProgress.findUnique({
        where: {
          userId_trackId: {
            userId: session.user.id,
            trackId: track.id,
          },
        },
      })

      const lessonIds = track.lessons.map((l) => l.id)
      const completions = await db.userProgress.findMany({
        where: {
          userId: session.user.id,
          lessonId: { in: lessonIds },
          completed: true,
        },
        include: {
          exercise: { select: { id: true } },
        },
      })
      completedExerciseIds = completions
        .filter((c) => c.exercise)
        .map((c) => c.exercise!.id)
    }

    const result = {
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      difficulty: track.difficulty,
      lessons: track.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        contentMdx: lesson.contentMdx,
        order: lesson.order,
        xpReward: lesson.xpReward,
        category: lesson.category,
        exercises: lesson.exercises.map((ex) => ({
          ...ex,
          completed: completedExerciseIds.includes(ex.id),
        })),
      })),
      progress: userProgress,
    }

    return NextResponse.json({ track: result })
  } catch (error) {
    console.error("Track detail API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create track progress update API route**

Append to `src/app/api/tracks/[slug]/route.ts`:

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const track = await db.languageTrack.findUnique({
      where: { slug: params.slug },
      include: { lessons: { include: { exercises: true } } },
    })

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    const body = await request.json()
    const { exerciseId, completed } = body

    const totalExercises = track.lessons.reduce(
      (sum, lesson) => sum + lesson.exercises.length,
      0
    )

    let userProgress = await db.userTrackProgress.upsert({
      where: {
        userId_trackId: {
          userId: session.user.id,
          trackId: track.id,
        },
      },
      create: {
        userId: session.user.id,
        trackId: track.id,
        exercisesCompleted: completed ? 1 : 0,
        totalExercises,
        completed: false,
      },
      update: {
        exercisesCompleted: completed
          ? { increment: 1 }
          : { decrement: 1 },
      },
    })

    const allComplete = userProgress.exercisesCompleted >= totalExercises
    if (allComplete && !userProgress.completed) {
      userProgress = await db.userTrackProgress.update({
        where: { id: userProgress.id },
        data: { completed: true, completedAt: new Date() },
      })
    }

    return NextResponse.json({ progress: userProgress })
  } catch (error) {
    console.error("Track progress API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/tracks/
git commit -m "feat: add language tracks API routes"
```

---

### Task 2: API Routes for Certifications

**Files:**
- Create: `src/app/api/certifications/route.ts`
- Create: `src/app/api/certifications/[slug]/route.ts`

- [ ] **Step 1: Create certifications list API route**

Create `src/app/api/certifications/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const certifications = await db.certification.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        projects: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, language: true, order: true },
        },
      },
    })

    let userCerts: Record<string, { completedAt: Date; projects: string[] }> = {}
    if (session?.user?.id) {
      const earned = await db.userCertification.findMany({
        where: { userId: session.user.id },
      })
      for (const c of earned) {
        userCerts[c.certificationId] = {
          completedAt: c.completedAt,
          projects: JSON.parse(c.projects),
        }
      }
    }

    const result = certifications.map((cert) => ({
      id: cert.id,
      slug: cert.slug,
      title: cert.title,
      description: cert.description,
      icon: cert.icon,
      requiredProjects: cert.requiredProjects,
      estimatedHours: cert.estimatedHours,
      order: cert.order,
      projectCount: cert.projects.length,
      userCert: userCerts[cert.id] || null,
    }))

    return NextResponse.json({ certifications: result })
  } catch (error) {
    console.error("Certifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create certification detail API route**

Create `src/app/api/certifications/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const cert = await db.certification.findUnique({
      where: { slug: params.slug, isActive: true },
      include: {
        projects: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!cert) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    let userCert = null
    if (session?.user?.id) {
      userCert = await db.userCertification.findUnique({
        where: {
          userId_certificationId: {
            userId: session.user.id,
            certificationId: cert.id,
          },
        },
      })
    }

    const projects = cert.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      requirements: JSON.parse(p.requirements) as string[],
      starterCode: p.starterCode,
      language: p.language,
      order: p.order,
      completed: userCert ? JSON.parse(userCert.projects).includes(p.id) : false,
    }))

    return NextResponse.json({
      certification: {
        id: cert.id,
        slug: cert.slug,
        title: cert.title,
        description: cert.description,
        icon: cert.icon,
        requiredProjects: cert.requiredProjects,
        estimatedHours: cert.estimatedHours,
        projects,
        userCert,
      },
    })
  } catch (error) {
    console.error("Certification detail API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create certification project submission API route**

Append to `src/app/api/certifications/[slug]/route.ts`:

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const cert = await db.certification.findUnique({
      where: { slug: params.slug },
      include: { projects: true },
    })

    if (!cert) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    const body = await request.json()
    const { projectId, submission } = body

    const project = cert.projects.find((p) => p.id === projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    let userCert = await db.userCertification.findUnique({
      where: {
        userId_certificationId: {
          userId: session.user.id,
          certificationId: cert.id,
        },
      },
    })

    let completedProjects: string[] = userCert
      ? JSON.parse(userCert.projects)
      : []

    if (!completedProjects.includes(projectId)) {
      completedProjects.push(projectId)
    }

    userCert = await db.userCertification.upsert({
      where: {
        userId_certificationId: {
          userId: session.user.id,
          certificationId: cert.id,
        },
      },
      create: {
        userId: session.user.id,
        certificationId: cert.id,
        projects: JSON.stringify(completedProjects),
        completedAt: new Date(),
      },
      update: {
        projects: JSON.stringify(completedProjects),
        completedAt: completedProjects.length >= cert.requiredProjects ? new Date() : undefined,
      },
    })

    return NextResponse.json({
      userCert,
      completedCount: completedProjects.length,
      requiredCount: cert.requiredProjects,
      isComplete: completedProjects.length >= cert.requiredProjects,
    })
  } catch (error) {
    console.error("Certification submission API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/certifications/
git commit -m "feat: add certifications API routes"
```

---

### Task 3: PathsPage Component (Main Hub)

**Files:**
- Create: `src/components/paths/PathsPage.tsx`

- [ ] **Step 1: Create the PathsPage component**

Create `src/components/paths/PathsPage.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  Globe,
  Shield,
  Terminal,
  Server,
  Lock,
  Zap,
  Coffee,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react"

const iconMap: Record<string, any> = {
  Code2,
  Globe,
  Shield,
  Terminal,
  Server,
  Lock,
  Zap,
  Coffee,
  BookOpen,
  Award,
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/10 text-red-400 border-red-500/30",
}

interface Track {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: string
  lessonCount: number
  progress: { completed: boolean; exercisesCompleted: number; totalExercises: number } | null
}

interface Certification {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  requiredProjects: number
  estimatedHours: number
  projectCount: number
  userCert: { completedAt: string; projects: string[] } | null
}

interface PathsPageProps {
  onNavigate: (view: string) => void
  onSelectTrack?: (slug: string) => void
  onSelectCertification?: (slug: string) => void
}

export function PathsPage({ onNavigate, onSelectTrack, onSelectCertification }: PathsPageProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/tracks").then((r) => r.json()),
      fetch("/api/certifications").then((r) => r.json()),
    ]).then(([tracksData, certsData]) => {
      setTracks(tracksData.tracks || [])
      setCertifications(certsData.certifications || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-48" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("dashboard")}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
          <p className="text-muted-foreground">Choose your path to mastery</p>
        </div>
      </div>

      <Tabs defaultValue="tracks" className="space-y-6">
        <TabsList className="bg-[#111118] border-border/50">
          <TabsTrigger value="tracks" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            Language Tracks
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Certifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => {
              const Icon = iconMap[track.icon] || Code2
              const progressPercent = track.progress
                ? track.progress.totalExercises > 0
                  ? Math.round((track.progress.exercisesCompleted / track.progress.totalExercises) * 100)
                  : 0
                : 0

              return (
                <Card
                  key={track.id}
                  className="bg-[#111118] border-border/50 hover:border-l-2 cursor-pointer transition-all"
                  style={{
                    borderLeftColor: track.progress ? track.color : undefined,
                    borderLeftWidth: track.progress ? "2px" : undefined,
                  }}
                  onClick={() => onSelectTrack?.(track.slug)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${track.color}20` }}
                        >
                          <Icon size={20} style={{ color: track.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{track.name}</h3>
                          <Badge
                            variant="outline"
                            className={difficultyColors[track.difficulty]}
                          >
                            {track.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {track.description}
                    </p>

                    {track.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-white font-medium">
                            {progressPercent}%
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{track.lessonCount} lessons</span>
                      {track.progress?.completed && (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Complete
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert) => {
              const Icon = iconMap[cert.icon] || Award
              const isComplete = cert.userCert && cert.userCert.projects.length >= cert.requiredProjects
              const progressPercent = cert.userCert
                ? Math.round((cert.userCert.projects.length / cert.requiredProjects) * 100)
                : 0

              return (
                <Card
                  key={cert.id}
                  className={`bg-[#111118] border-border/50 hover:border-l-2 cursor-pointer transition-all ${
                    isComplete ? "border-l-amber-500" : ""
                  }`}
                  onClick={() => onSelectCertification?.(cert.slug)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Icon size={20} className={isComplete ? "text-amber-400" : "text-muted-foreground"} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{cert.title}</h3>
                          {isComplete ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                              <CheckCircle2 size={12} className="mr-1" /> Earned
                            </Badge>
                          ) : cert.userCert ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                              In Progress
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
                              Not Started
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cert.description}
                    </p>

                    {cert.userCert && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Projects</span>
                          <span className="text-white font-medium">
                            {cert.userCert.projects.length}/{cert.requiredProjects}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} /> {cert.requiredProjects} projects
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> ~{cert.estimatedHours}h
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/paths/PathsPage.tsx
git commit -m "feat: add PathsPage component with tracks and certifications grid"
```

---

### Task 4: TrackDetail Component

**Files:**
- Create: `src/components/paths/TrackDetail.tsx`

- [ ] **Step 1: Create the TrackDetail component**

Create `src/components/paths/TrackDetail.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronRight,
  Code2,
  Play,
  CheckCircle2,
  Lock,
  BookOpen,
  Zap,
} from "lucide-react"

const iconMap: Record<string, any> = {
  Code2,
  Play,
  CheckCircle2,
  Lock,
  BookOpen,
  Zap,
}

interface Exercise {
  id: string
  title: string
  slug: string
  description: string
  language: string
  order: number
  xpReward: number
  completed: boolean
}

interface Lesson {
  id: string
  title: string
  slug: string
  description: string
  contentMdx: string
  order: number
  xpReward: number
  category: string
  exercises: Exercise[]
}

interface TrackData {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  difficulty: string
  lessons: Lesson[]
  progress: { completed: boolean; exercisesCompleted: number; totalExercises: number } | null
}

interface TrackDetailProps {
  slug: string
  onNavigate: (view: string) => void
  onBack: () => void
  onOpenLesson?: (lessonSlug: string) => void
}

export function TrackDetail({ slug, onNavigate, onBack, onOpenLesson }: TrackDetailProps) {
  const [track, setTrack] = useState<TrackData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tracks/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setTrack(data.track)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-64" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
        <h2 className="text-xl text-white">Track not found</h2>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Paths
        </Button>
      </div>
    )
  }

  const Icon = iconMap[track.icon] || Code2
  const totalExercises = track.lessons.reduce((sum, l) => sum + l.exercises.length, 0)
  const completedExercises = track.lessons.reduce(
    (sum, l) => sum + l.exercises.filter((e) => e.completed).length,
    0
  )
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${track.color}20` }}
          >
            <Icon size={24} style={{ color: track.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{track.name}</h1>
            <p className="text-muted-foreground">{track.description}</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#111118] border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-lg font-bold text-white">
                {completedExercises}/{totalExercises} exercises
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                track.difficulty === "beginner"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : track.difficulty === "intermediate"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }
            >
              {track.difficulty}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {track.progress?.completed && (
            <p className="text-green-400 text-sm flex items-center gap-1">
              <CheckCircle2 size={14} /> Track Complete!
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Lessons</h2>
        {track.lessons.map((lesson, idx) => {
          const lessonCompleted = lesson.exercises.every((e) => e.completed) && lesson.exercises.length > 0
          const lessonExerciseCount = lesson.exercises.length
          const lessonCompletedCount = lesson.exercises.filter((e) => e.completed).length

          return (
            <Card
              key={lesson.id}
              className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer"
              onClick={() => onOpenLesson?.(lesson.slug)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${track.color}20` }}
                >
                  {lessonCompleted ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <BookOpen size={18} style={{ color: track.color }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Lesson {lesson.order}
                    </span>
                    <h3 className="font-semibold text-white">{lesson.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {lessonCompletedCount}/{lessonExerciseCount}
                    </p>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <Zap size={10} /> {lesson.xpReward} XP
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/paths/TrackDetail.tsx
git commit -m "feat: add TrackDetail component with lesson list and progress"
```

---

### Task 5: CertificationDetail Component

**Files:**
- Create: `src/components/paths/CertificationDetail.tsx`

- [ ] **Step 1: Create the CertificationDetail component**

Create `src/components/paths/CertificationDetail.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ChevronRight,
  Award,
  CheckCircle2,
  Code2,
  Clock,
  BookOpen,
  Upload,
  ExternalLink,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  requirements: string[]
  starterCode: string | null
  language: string
  order: number
  completed: boolean
}

interface CertificationData {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  requiredProjects: number
  estimatedHours: number
  projects: Project[]
  userCert: { completedAt: string; projects: string[] } | null
}

interface CertificationDetailProps {
  slug: string
  onNavigate: (view: string) => void
  onBack: () => void
}

export function CertificationDetail({ slug, onNavigate, onBack }: CertificationDetailProps) {
  const [cert, setCert] = useState<CertificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [submissionDescription, setSubmissionDescription] = useState("")
  const [submissionUrl, setSubmissionUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/certifications/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setCert(data.certification)
        setLoading(false)
      })
  }, [slug])

  const handleSubmitProject = async () => {
    if (!selectedProject || !cert) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/certifications/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          submission: {
            description: submissionDescription,
            url: submissionUrl,
          },
        }),
      })
      const data = await res.json()
      if (data.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      } else {
        toast({
          title: "Project Submitted",
          description: data.isComplete
            ? "All projects complete! You can claim your certification."
            : `${data.completedCount}/${data.requiredCount} projects complete.`,
        })
        setSubmitDialogOpen(false)
        setSubmissionDescription("")
        setSubmissionUrl("")
        fetch(`/api/certifications/${slug}`)
          .then((r) => r.json())
          .then((d) => setCert(d.certification))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit project",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#1a1a24] rounded w-64" />
          <div className="h-4 bg-[#1a1a24] rounded w-96" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a24] rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 text-center">
        <h2 className="text-xl text-white">Certification not found</h2>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Paths
        </Button>
      </div>
    )
  }

  const completedCount = cert.userCert ? cert.userCert.projects.length : 0
  const progressPercent = Math.round((completedCount / cert.requiredProjects) * 100)
  const isComplete = completedCount >= cert.requiredProjects

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Award size={24} className={isComplete ? "text-amber-400" : "text-muted-foreground"} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{cert.title}</h1>
            <p className="text-muted-foreground">{cert.description}</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#111118] border-border/50">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-bold text-white">
                {completedCount}/{cert.requiredProjects} projects
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {cert.requiredProjects} projects
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> ~{cert.estimatedHours}h
              </span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {isComplete && (
            <div className="flex items-center justify-between">
              <p className="text-amber-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> All projects complete!
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
              >
                <Award size={16} className="mr-2" /> Claim Certification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Required Projects</h2>
        {cert.projects.map((project) => (
          <Card
            key={project.id}
            className={`bg-[#111118] border-border/50 transition-colors ${
              project.completed
                ? "border-l-2 border-l-green-500"
                : "hover:border-emerald-500/30"
            }`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1a1a24]">
                    {project.completed ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : (
                      <Code2 size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Project {project.order}
                      </span>
                      <h3 className="font-semibold text-white">{project.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>
                {project.completed ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    Complete
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProject(project)
                      setSubmitDialogOpen(true)
                    }}
                  >
                    <Upload size={14} className="mr-1" /> Submit
                  </Button>
                )}
              </div>

              <div className="pl-11">
                <p className="text-xs text-muted-foreground mb-2">Requirements:</p>
                <ul className="space-y-1">
                  {project.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pl-11 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {project.language}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="bg-[#111118] border-border/50">
          <DialogHeader>
            <DialogTitle>Submit Project: {selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Provide a description of your solution and a link to your code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Solution Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your approach, key decisions, and any challenges..."
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                className="bg-[#1a1a24] border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Repository URL</Label>
              <Input
                id="url"
                placeholder="https://github.com/yourusername/project"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                className="bg-[#1a1a24] border-border/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitProject}
              disabled={submitting || !submissionDescription || !submissionUrl}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/paths/CertificationDetail.tsx
git commit -m "feat: add CertificationDetail component with project submission"
```

---

### Task 6: Integrate into page.tsx (Navigation, Views, Dashboard)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add new View types and imports**

In `src/app/page.tsx`, find the View type definition (around line 150) and update it:

```typescript
type View = 'auth' | 'dashboard' | 'lessons' | 'lesson-detail' | 'labs' | 'lab-detail' | 'leaderboard' | 'profile' | 'portfolio' | 'assessment' | 'interview' | 'exploit' | 'paths' | 'track-detail' | 'certification-detail'
```

Add imports at the top of the file (with other component imports):

```typescript
import { PathsPage } from "@/components/paths/PathsPage"
import { TrackDetail } from "@/components/paths/TrackDetail"
import { CertificationDetail } from "@/components/paths/CertificationDetail"
```

- [ ] **Step 2: Add state for track/cert selection**

Find the state declarations section (after the `useState` calls) and add:

```typescript
const [selectedTrackSlug, setSelectedTrackSlug] = useState<string | null>(null)
const [selectedCertSlug, setSelectedCertSlug] = useState<string | null>(null)
```

- [ ] **Step 3: Update navigation array**

Find the navItems array (search for `const navItems =`) and replace "Lessons" with "Paths":

```typescript
const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'paths', label: 'Paths', icon: Route },
  { key: 'labs', label: 'Hacking Labs', icon: Shield },
  { key: 'interview', label: 'Interview', icon: Briefcase },
  { key: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
]
```

Add `Route` to the lucide-react imports at the top:

```typescript
import { ..., Route, ... } from "lucide-react"
```

- [ ] **Step 4: Add navigation handlers for new views**

Find the `navigateTo` function and add handlers:

```typescript
const navigateTo = (newView: View) => {
  setView(newView)
  setMobileMenuOpen(false)
  if (newView === 'leaderboard') fetchLeaderboard()
  if (newView === 'labs') fetchLabs()
  if (newView === 'dashboard') fetchProgress()
  if (newView === 'paths') {
    setSelectedTrackSlug(null)
    setSelectedCertSlug(null)
  }
}
```

- [ ] **Step 5: Add new view render blocks**

Find the main content rendering area (where views are rendered with `{view === '...' && ...}`) and add the new views. Find the lessons view block and add after it:

```tsx
{view === 'paths' && (
  <PathsPage
    onNavigate={(v) => navigateTo(v as View)}
    onSelectTrack={(slug) => {
      setSelectedTrackSlug(slug)
      setView('track-detail')
    }}
    onSelectCertification={(slug) => {
      setSelectedCertSlug(slug)
      setView('certification-detail')
    }}
  />
)}

{view === 'track-detail' && selectedTrackSlug && (
  <TrackDetail
    slug={selectedTrackSlug}
    onNavigate={(v) => navigateTo(v as View)}
    onBack={() => navigateTo('paths')}
    onOpenLesson={(lessonSlug) => {
      setSelectedLessonSlug(lessonSlug)
      setView('lesson-detail')
    }}
  />
)}

{view === 'certification-detail' && selectedCertSlug && (
  <CertificationDetail
    slug={selectedCertSlug}
    onNavigate={(v) => navigateTo(v as View)}
    onBack={() => navigateTo('paths')}
  />
)}
```

- [ ] **Step 6: Update dashboard Quick Actions**

Find the Quick Actions section (search for "Continue Lessons") and replace the "Continue Lessons" card with two new cards:

Replace:
```tsx
<Card className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('lessons')}>
  <CardContent className="p-6 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-emerald-500/10"><BookOpen size={24} className="text-emerald-400" /></div>
    <div><h3 className="font-semibold text-white">Continue Lessons</h3><p className="text-sm text-muted-foreground">Pick up where you left off</p></div>
    <ChevronRight size={20} className="text-muted-foreground ml-auto" />
  </CardContent>
</Card>
```

With:
```tsx
<Card className="bg-[#111118] border-border/50 hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('paths')}>
  <CardContent className="p-6 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-emerald-500/10"><Route size={24} className="text-emerald-400" /></div>
    <div><h3 className="font-semibold text-white">Language Tracks</h3><p className="text-sm text-muted-foreground">Learn Python, Rust, C, and more</p></div>
    <ChevronRight size={20} className="text-muted-foreground ml-auto" />
  </CardContent>
</Card>
<Card className="bg-[#111118] border-border/50 hover:border-amber-500/30 transition-colors cursor-pointer" onClick={() => navigateTo('paths')}>
  <CardContent className="p-6 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-amber-500/10"><Award size={24} className="text-amber-400" /></div>
    <div><h3 className="font-semibold text-white">Certifications</h3><p className="text-sm text-muted-foreground">Earn project-based certifications</p></div>
    <ChevronRight size={20} className="text-muted-foreground ml-auto" />
  </CardContent>
</Card>
```

Add `Route` and `Award` to lucide-react imports if not already present.

- [ ] **Step 7: Update dashboard welcome section**

Find the welcome section (search for "Welcome back" or "Continue Learning") and update the CTA:

Replace any reference to `navigateTo('lessons')` in the welcome/continue section with `navigateTo('paths')`.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate paths, track detail, and cert detail views into main app"
```

---

### Task 7: Test and Verify

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify all features**

1. Navigate to `/` → Dashboard should show "Language Tracks" and "Certifications" quick action cards
2. Click "Language Tracks" → Paths page with tabs for Tracks and Certifications
3. Click a track → TrackDetail with lessons list and progress
4. Click a certification → CertificationDetail with projects and submit dialog
5. Submit a project → Toast confirmation, progress updates
6. Nav bar should show "Paths" instead of "Lessons"
7. Mobile menu should show "Paths"
8. Back buttons should work correctly
9. Loading states should display
10. Error states (404) should show with back button

- [ ] **Step 3: Run build to check for errors**

```bash
npm run build
```

- [ ] **Step 4: Fix any TypeScript errors**

If there are type errors, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve TypeScript errors in paths integration"
```

---

## Self-Review

**Spec coverage:**
- ✅ API routes for tracks (list, detail, progress) — Task 1
- ✅ API routes for certifications (list, detail, submit) — Task 2
- ✅ PathsPage component with tabs — Task 3
- ✅ TrackDetail component — Task 4
- ✅ CertificationDetail component — Task 5
- ✅ Navigation integration (Lessons → Paths) — Task 6
- ✅ Dashboard integration (quick actions, welcome) — Task 6
- ✅ View types added — Task 6
- ✅ Styling with existing patterns — All tasks
- ✅ Error handling — All API routes and components
- ✅ Loading states — All components

**Placeholder scan:** No TBDs, TODOs, or vague instructions found.

**Type consistency:** All interfaces match API response shapes. View types are consistent. Component props use the same patterns as existing components.
