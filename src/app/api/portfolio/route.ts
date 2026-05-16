import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const artifacts = await db.portfolioArtifact.findMany({
      where: { userId: session.user.id },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    })

    const completedLabs = await db.labSession.findMany({
      where: { userId: session.user.id, solved: true },
      include: { lab: { select: { title: true, difficulty: true, category: true } } },
    })

    const completedExercises = await db.userExerciseAttempt.findMany({
      where: { userId: session.user.id, passed: true },
      distinct: ["exerciseId"],
      include: { exercise: { select: { title: true, lesson: { select: { title: true } } } } },
    })

    const autoArtifacts = [
      ...completedLabs.map((s) => ({
        id: `auto-lab-${s.labId}`,
        type: "lab" as const,
        title: s.lab.title,
        description: `Solved ${s.lab.difficulty} ${s.lab.category} CTF challenge`,
        sourceId: s.labId,
        featured: false,
        createdAt: s.solvedAt?.toISOString() ?? new Date().toISOString(),
        url: null,
      })),
      ...completedExercises.map((a) => ({
        id: `auto-ex-${a.exerciseId}`,
        type: "exercise" as const,
        title: a.exercise.title,
        description: `Completed exercise in "${a.exercise.lesson.title}"`,
        sourceId: a.exerciseId,
        featured: false,
        createdAt: a.createdAt.toISOString(),
        url: null,
      })),
    ]

    return NextResponse.json({ artifacts: [...artifacts, ...autoArtifacts] })
  } catch (error) {
    console.error("Portfolio API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, description, url, sourceId, featured } = body

    if (!type || !title || !sourceId) {
      return NextResponse.json({ error: "type, title, and sourceId are required" }, { status: 400 })
    }

    const artifact = await db.portfolioArtifact.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description: description || "",
        url: url || null,
        sourceId,
        featured: featured || false,
      },
    })

    return NextResponse.json({ artifact }, { status: 201 })
  } catch (error) {
    console.error("Portfolio create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
