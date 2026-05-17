import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const session = await getServerSession(authOptions)
    const track = await db.languageTrack.findUnique({
      where: { slug, isActive: true },
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

    let userProgress: any = null
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

      const exerciseIds = track.lessons.flatMap((l) => l.exercises.map((e) => e.id))
      const attempts = await db.userExerciseAttempt.findMany({
        where: {
          userId: session.user.id,
          exerciseId: { in: exerciseIds },
          passed: true,
        },
        select: { exerciseId: true },
      })
      completedExerciseIds = attempts.map((a) => a.exerciseId)
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const track = await db.languageTrack.findUnique({
      where: { slug },
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
