import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const tracks = await db.languageTrack.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    })

    let userProgress: Record<string, { completed: boolean; exercisesCompleted: number; totalExercises: number }> = {}
    if (session?.user?.id) {
      const progress = await db.userTrackProgress.findMany({
        where: { userId: session.user.id },
      })
      for (const p of progress) {
        userProgress[p.trackId] = {
          completed: p.completed,
          exercisesCompleted: p.exercisesCompleted,
          totalExercises: p.totalExercises,
        }
      }
    }

    const result = tracks.map((track) => ({
      id: track.id,
      slug: track.slug,
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      difficulty: track.difficulty,
      order: track.order,
      lessonCount: track.lessons.length,
      progress: userProgress[track.id] || null,
    }))

    return NextResponse.json({ tracks: result })
  } catch (error) {
    console.error("Tracks API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
