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

    // Get lesson by slug with exercises, hints, and test cases
    const lesson = await db.lesson.findUnique({
      where: { slug },
      include: {
        phase: true,
        exercises: {
          orderBy: { order: "asc" },
          include: {
            hints: {
              orderBy: { level: "asc" },
            },
            testCases: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    let userProgress = null
    let exerciseAttempts: Record<string, { passed: boolean; attemptNum: number; output: string | null }[]> = {}

    if (session?.user?.id) {
      // Get user progress for this lesson
      const progress = await db.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id,
          },
        },
      })
      userProgress = progress
        ? {
            completed: progress.completed,
            completedAt: progress.completedAt?.toISOString() ?? null,
            hintsUsed: progress.hintsUsed,
          }
        : null

      // Get user's exercise attempts for this lesson's exercises
      const exerciseIds = lesson.exercises.map((e) => e.id)
      const attempts = await db.userExerciseAttempt.findMany({
        where: {
          userId: session.user.id,
          exerciseId: { in: exerciseIds },
        },
        orderBy: { attemptNum: "desc" },
      })

      exerciseAttempts = attempts.reduce(
        (acc, attempt) => {
          if (!acc[attempt.exerciseId]) {
            acc[attempt.exerciseId] = []
          }
          acc[attempt.exerciseId].push({
            passed: attempt.passed,
            attemptNum: attempt.attemptNum,
            output: attempt.output,
          })
          return acc
        },
        {} as Record<string, { passed: boolean; attemptNum: number; output: string | null }[]>
      )
    }

    // Filter out hidden test cases for non-authenticated users or show all
    const exercises = lesson.exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      slug: exercise.slug,
      description: exercise.description,
      starterCode: exercise.starterCode,
      language: exercise.language,
      order: exercise.order,
      xpReward: exercise.xpReward,
      hints: exercise.hints.map((hint) => ({
        id: hint.id,
        level: hint.level,
        content: hint.content,
        xpCost: hint.xpCost,
      })),
      testCases: exercise.testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        order: tc.order,
      })),
      attempts: exerciseAttempts[exercise.id] || [],
    }))

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        contentMdx: lesson.contentMdx,
        order: lesson.order,
        xpReward: lesson.xpReward,
        category: lesson.category,
        phase: {
          id: lesson.phase.id,
          number: lesson.phase.number,
          title: lesson.phase.title,
          description: lesson.phase.description,
          icon: lesson.phase.icon,
        },
        exercises,
        progress: userProgress,
      }
    })
  } catch (error) {
    console.error("Lesson detail API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
