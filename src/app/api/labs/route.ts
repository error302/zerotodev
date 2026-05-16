import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phase = searchParams.get("phase")
    const difficulty = searchParams.get("difficulty")
    const category = searchParams.get("category")

    // Build filter conditions using proper Prisma type
    const where: Prisma.HackingLabWhereInput = {
      isPublished: true,
    }

    if (phase) {
      where.phase = parseInt(phase, 10)
    }
    if (difficulty) {
      where.difficulty = difficulty
    }
    if (category) {
      where.category = category
    }

    // Get published hacking labs matching filters
    const labs = await db.hackingLab.findMany({
      where,
      orderBy: [{ phase: "asc" }, { order: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        phase: true,
        difficulty: true,
        category: true,
        xpReward: true,
        order: true,
        labUrl: true,
        downloadUrl: true,
        hintContent: true,
        setupMdx: true,
        toolsHint: true,
        briefingMdx: true,
        author: true,
      },
    })

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    let labSessions: Record<string, { solved: boolean; attempts: number; startedAt: string }> = {}

    if (session?.user?.id) {
      const sessions = await db.labSession.findMany({
        where: {
          userId: session.user.id,
          labId: { in: labs.map((lab) => lab.id) },
        },
      })
      labSessions = sessions.reduce(
        (acc, s) => {
          acc[s.labId] = {
            solved: s.solved,
            attempts: s.attempts,
            startedAt: s.startedAt.toISOString(),
          }
          return acc
        },
        {} as Record<string, { solved: boolean; attempts: number; startedAt: string }>
      )
    }

    const result = labs.map((lab) => ({
      ...lab,
      session: labSessions[lab.id] || null,
    }))

    return NextResponse.json({ labs: result })
  } catch (error) {
    console.error("Labs API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
