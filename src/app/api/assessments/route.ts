import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const assessments = await db.assessment.findMany({
      orderBy: [{ phaseNumber: "asc" }, { order: "asc" }],
      include: { _count: { select: { problems: true } } },
    })

    let userAttempts: Record<string, { score: number | null; passed: boolean | null; submittedAt: string | null }> = {}
    if (session?.user?.id) {
      const attempts = await db.assessmentAttempt.findMany({ where: { userId: session.user.id } })
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
