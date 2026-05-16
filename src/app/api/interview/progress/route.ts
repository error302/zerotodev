import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const total = await db.interviewProblem.count()
    const solvedAttempts = await db.interviewAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      distinct: ["problemId"],
      select: { id: true },
    })
    const solved = solvedAttempts.length

    const byCategory = await db.interviewProblem.groupBy({ by: ["category"], _count: true })
    const solvedByCategory = await db.interviewAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      include: { problem: { select: { category: true } } },
      distinct: ["problemId"],
    })
    const categoryBreakdown = byCategory.map((c) => ({
      category: c.category, total: c._count,
      solved: solvedByCategory.filter((a) => a.problem.category === c.category).length,
    }))

    const byDifficulty = await db.interviewProblem.groupBy({ by: ["difficulty"], _count: true })
    const solvedByDifficulty = await db.interviewAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      include: { problem: { select: { difficulty: true } } },
      distinct: ["problemId"],
    })
    const difficultyBreakdown = byDifficulty.map((d) => ({
      difficulty: d.difficulty, total: d._count,
      solved: solvedByDifficulty.filter((a) => a.problem.difficulty === d.difficulty).length,
    }))

    return NextResponse.json({ total, solved, categoryBreakdown, difficultyBreakdown })
  } catch (error) {
    console.error("Interview progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
