import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const assessment = await db.assessment.findUnique({
      where: { slug },
      include: { problems: { orderBy: { order: "asc" } } },
    })

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        slug: assessment.slug,
        description: assessment.description,
        timeLimit: assessment.timeLimit,
        passScore: assessment.passScore,
        problems: assessment.problems.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          description: p.description,
          starterCode: p.starterCode,
          language: p.language,
          points: p.points,
          order: p.order,
        })),
      },
    })
  } catch (error) {
    console.error("Assessment detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
