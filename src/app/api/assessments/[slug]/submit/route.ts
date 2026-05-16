import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
      if (problem.type === "coding" && answer?.code) {
        earnedPoints += problem.points
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= assessment.passScore

    if (existing) {
      await db.assessmentAttempt.update({
        where: { id: existing.id },
        data: { answers: JSON.stringify(answers), submittedAt: new Date(), score, passed },
      })
    } else {
      await db.assessmentAttempt.create({
        data: { userId: session.user.id, assessmentId: assessment.id, answers: JSON.stringify(answers), submittedAt: new Date(), score, passed },
      })
    }

    if (passed) {
      await db.user.update({
        where: { id: session.user.id },
        data: { xpTotal: { increment: 100 }, lastActiveAt: new Date() },
      })
    }

    return NextResponse.json({ score, passed, earnedPoints, totalPoints, passScore: assessment.passScore })
  } catch (error) {
    console.error("Assessment submit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
