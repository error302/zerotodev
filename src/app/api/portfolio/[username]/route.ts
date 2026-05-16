import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const user = await db.user.findUnique({
      where: { username },
      select: { id: true, username: true, xpTotal: true, currentPhase: true, streak: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const artifacts = await db.portfolioArtifact.findMany({
      where: { userId: user.id, featured: true },
      orderBy: { createdAt: "desc" },
    })

    const completedLessons = await db.userProgress.count({
      where: { userId: user.id, completed: true },
    })

    const solvedLabs = await db.labSession.count({
      where: { userId: user.id, solved: true },
    })

    const interviewAttempts = await db.interviewAttempt.findMany({
      where: { userId: user.id, passed: true },
      distinct: ["problemId"],
      select: { id: true },
    })
    const interviewSolved = interviewAttempts.length

    return NextResponse.json({
      user: {
        username: user.username,
        xpTotal: user.xpTotal,
        currentPhase: user.currentPhase,
        streak: user.streak,
        completedLessons,
        solvedLabs,
        interviewSolved,
      },
      artifacts,
    })
  } catch (error) {
    console.error("Public portfolio error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
