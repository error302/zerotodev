import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkAllPhaseGates } from "@/lib/phase-gate"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const phaseCount = await db.phase.count()
    const gates = await checkAllPhaseGates(session.user.id, phaseCount)

    return NextResponse.json({ gates })
  } catch (error) {
    console.error("Phase gate API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
