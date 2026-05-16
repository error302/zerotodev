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
      select: { id: true, title: true, slug: true, difficulty: true, category: true, xpReward: true, pattern: true },
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

    return NextResponse.json({ problems: problems.map((p) => ({ ...p, solved: solvedIds.includes(p.id) })) })
  } catch (error) {
    console.error("Interview problems API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
