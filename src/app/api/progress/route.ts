import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get completed lessons
    const completedLessons = await db.userProgress.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            xpReward: true,
            category: true,
            phase: {
              select: {
                number: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    // Get completed exercises (attempts that passed)
    const completedExercises = await db.userExerciseAttempt.findMany({
      where: {
        userId,
        passed: true,
      },
      distinct: ["exerciseId"],
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            slug: true,
            xpReward: true,
            lesson: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    // Get solved labs
    const solvedLabs = await db.labSession.findMany({
      where: {
        userId,
        solved: true,
      },
      include: {
        lab: {
          select: {
            id: true,
            title: true,
            slug: true,
            xpReward: true,
            category: true,
            difficulty: true,
            phase: true,
          },
        },
      },
      orderBy: { solvedAt: "desc" },
    })

    // Calculate XP breakdown
    const lessonXpEarned = completedLessons.reduce(
      (sum, lp) => sum + lp.lesson.xpReward,
      0
    )
    const exerciseXpEarned = completedExercises.reduce(
      (sum, ea) => sum + ea.exercise.xpReward,
      0
    )
    const labXpEarned = solvedLabs.reduce(
      (sum, ls) => sum + ls.lab.xpReward,
      0
    )
    const achievementXpEarned = user.achievements.reduce(
      (sum, ua) => sum + ua.achievement.xpBonus,
      0
    )
    const signupXp = 100
    const totalCalculatedXp =
      signupXp + lessonXpEarned + exerciseXpEarned + labXpEarned + achievementXpEarned

    // Get total counts for progress calculation
    const totalLessons = await db.lesson.count()
    const totalExercises = await db.exercise.count()
    const totalLabs = await db.hackingLab.count({ where: { isPublished: true } })

    // Get phases progress
    const phases = await db.phase.findMany({
      orderBy: { number: "asc" },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    })

    const phaseProgress = await Promise.all(
      phases.map(async (phase) => {
        const lessonsInPhase = await db.lesson.findMany({
          where: { phaseId: phase.id },
          select: { id: true },
        })
        const lessonIds = lessonsInPhase.map((l) => l.id)

        const completedInPhase = await db.userProgress.count({
          where: {
            userId,
            lessonId: { in: lessonIds },
            completed: true,
          },
        })

        return {
          id: phase.id,
          number: phase.number,
          title: phase.title,
          description: phase.description,
          icon: phase.icon,
          totalLessons: lessonIds.length,
          completedLessons: completedInPhase,
        }
      })
    )

    // Calculate streak info
    const lastActiveDate = user.lastActiveAt
    const now = new Date()
    const isStreakActive =
      lastActiveDate &&
      (now.getTime() - lastActiveDate.getTime()) < 48 * 60 * 60 * 1000 // Within 48 hours

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        xpTotal: user.xpTotal,
        currentPhase: user.currentPhase,
        streak: user.streak,
        isStreakActive: !!isStreakActive,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt.toISOString(),
      },
      stats: {
        completedLessons: completedLessons.length,
        totalLessons,
        completedExercises: completedExercises.length,
        totalExercises,
        solvedLabs: solvedLabs.length,
        totalLabs,
        achievements: user.achievements.length,
      },
      xpBreakdown: {
        signup: signupXp,
        lessons: lessonXpEarned,
        exercises: exerciseXpEarned,
        labs: labXpEarned,
        achievements: achievementXpEarned,
        total: totalCalculatedXp,
        stored: user.xpTotal,
      },
      completedLessons: completedLessons.map((cl) => ({
        lessonId: cl.lesson.id,
        title: cl.lesson.title,
        slug: cl.lesson.slug,
        xpReward: cl.lesson.xpReward,
        category: cl.lesson.category,
        phase: cl.lesson.phase,
        completedAt: cl.completedAt?.toISOString() ?? null,
      })),
      completedExercises: completedExercises.map((ce) => ({
        exerciseId: ce.exercise.id,
        title: ce.exercise.title,
        slug: ce.exercise.slug,
        xpReward: ce.exercise.xpReward,
        lessonTitle: ce.exercise.lesson.title,
        lessonSlug: ce.exercise.lesson.slug,
      })),
      solvedLabs: solvedLabs.map((sl) => ({
        labId: sl.lab.id,
        title: sl.lab.title,
        slug: sl.lab.slug,
        xpReward: sl.lab.xpReward,
        category: sl.lab.category,
        difficulty: sl.lab.difficulty,
        phase: sl.lab.phase,
        solvedAt: sl.solvedAt?.toISOString() ?? null,
      })),
      achievements: user.achievements.map((ua) => ({
        id: ua.achievement.id,
        slug: ua.achievement.slug,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpBonus: ua.achievement.xpBonus,
        category: ua.achievement.category,
        unlockedAt: ua.unlockedAt.toISOString(),
      })),
      phaseProgress,
    })
  } catch (error) {
    console.error("Progress API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
