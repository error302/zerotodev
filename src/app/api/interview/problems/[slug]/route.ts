import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const problem = await db.interviewProblem.findUnique({ where: { slug } })
    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 })

    return NextResponse.json({
      problem: {
        id: problem.id, title: problem.title, slug: problem.slug,
        difficulty: problem.difficulty, category: problem.category,
        description: problem.description, starterCode: problem.starterCode,
        language: problem.language, xpReward: problem.xpReward,
        pattern: problem.pattern, hints: problem.hints ? JSON.parse(problem.hints) : [],
      },
    })
  } catch (error) {
    console.error("Interview problem detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
