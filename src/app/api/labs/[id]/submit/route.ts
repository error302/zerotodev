import { createHash } from 'crypto'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { submittedFlag } = body

    if (!submittedFlag) {
      return NextResponse.json(
        { error: "submittedFlag is required" },
        { status: 400 }
      )
    }

    // Find the lab
    const lab = await db.hackingLab.findUnique({
      where: { id },
    })

    if (!lab) {
      return NextResponse.json(
        { error: "Lab not found" },
        { status: 404 }
      )
    }

    if (!lab.isPublished) {
      return NextResponse.json(
        { error: "Lab is not available" },
        { status: 403 }
      )
    }

    // Find or create lab session
    const existingSession = await db.labSession.findUnique({
      where: {
        userId_labId: {
          userId: session.user.id,
          labId: lab.id,
        },
      },
    })

    // If already solved, don't allow re-submission
    if (existingSession?.solved) {
      return NextResponse.json({
        success: true,
        alreadySolved: true,
        message: "You have already solved this lab",
      })
    }

    // Compare submitted flag to expected flag using SHA-256 hashes
    const submittedFlagHash = createHash('sha256').update(submittedFlag.trim()).digest('hex')
    const expectedFlagHash = createHash('sha256').update(lab.expectedFlag.trim()).digest('hex')
    const isCorrect = submittedFlagHash === expectedFlagHash

    if (existingSession) {
      // Update existing session
      await db.labSession.update({
        where: { id: existingSession.id },
        data: {
          submittedFlag,
          solved: isCorrect,
          attempts: { increment: 1 },
          solvedAt: isCorrect ? new Date() : undefined,
        },
      })
    } else {
      // Create new session
      await db.labSession.create({
        data: {
          userId: session.user.id,
          labId: lab.id,
          submittedFlag,
          solved: isCorrect,
          attempts: 1,
          solvedAt: isCorrect ? new Date() : undefined,
        },
      })
    }

    // If correct, award XP
    if (isCorrect) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          xpTotal: { increment: lab.xpReward },
          lastActiveAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: isCorrect,
      message: isCorrect
        ? "Correct flag! Well done!"
        : "Incorrect flag. Try again!",
      xpEarned: isCorrect ? lab.xpReward : 0,
    })
  } catch (error) {
    console.error("Lab submit API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
