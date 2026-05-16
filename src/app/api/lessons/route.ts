import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phaseParam = searchParams.get("phase")

    // Get all phases with their lessons
    const phases = await db.phase.findMany({
      orderBy: { number: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    })

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    let userProgress: Record<string, { completed: boolean; completedAt: string | null; hintsUsed: number }> = {}

    if (session?.user?.id) {
      const progress = await db.userProgress.findMany({
        where: {
          userId: session.user.id,
        },
      })
      userProgress = progress.reduce(
        (acc, p) => {
          acc[p.lessonId] = {
            completed: p.completed,
            completedAt: p.completedAt?.toISOString() ?? null,
            hintsUsed: p.hintsUsed,
          }
          return acc
        },
        {} as Record<string, { completed: boolean; completedAt: string | null; hintsUsed: number }>
      )
    }

    // If a specific phase is requested, filter to just that phase
    let filteredPhases = phases
    if (phaseParam) {
      const phaseNumber = parseInt(phaseParam, 10)
      filteredPhases = phases.filter(p => p.number === phaseNumber)
    }

    const result = filteredPhases.map((phase) => ({
      id: phase.id,
      number: phase.number,
      title: phase.title,
      description: phase.description,
      icon: phase.icon,
      lessons: phase.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        order: lesson.order,
        xpReward: lesson.xpReward,
        category: lesson.category,
        exercisesCount: lesson._count.exercises,
        progress: userProgress[lesson.id] || null,
      })),
    }))

    return NextResponse.json({ phases: result })
  } catch (error) {
    console.error("Lessons API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
