import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get top 50 users by XP total
    const users = await db.user.findMany({
      orderBy: { xpTotal: "desc" },
      take: 50,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        xpTotal: true,
        currentPhase: true,
        streak: true,
        progress: {
          where: { completed: true },
          select: { id: true },
        },
      },
    })

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      xpTotal: user.xpTotal,
      currentPhase: user.currentPhase,
      streak: user.streak,
      completedLessons: user.progress.length,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
