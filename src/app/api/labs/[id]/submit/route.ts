import { createHash } from 'crypto'
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const limit = rateLimit(`flag:${session.user.id}`, { windowMs: 60 * 1000, max: 10 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many flag attempts. Please wait before trying again." },
        { status: 429 }
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

    const existingSession = await db.labSession.findUnique({
      where: {
        userId_labId: {
          userId: session.user.id,
          labId: lab.id,
        },
      },
    })

    if (existingSession?.solved) {
      return NextResponse.json({
        success: true,
        alreadySolved: true,
        message: "You have already solved this lab",
      })
    }

    const submittedFlagHash = createHash('sha256').update(submittedFlag.trim()).digest('hex')
    const expectedFlagHash = createHash('sha256').update(lab.expectedFlag.trim()).digest('hex')
    const isCorrect = submittedFlagHash === expectedFlagHash

    if (existingSession) {
      await db.labSession.update({
        where: { id: existingSession.id },
        data: {
          submittedFlag: submittedFlagHash,
          solved: isCorrect,
          attempts: { increment: 1 },
          solvedAt: isCorrect ? new Date() : undefined,
        },
      })
    } else {
      await db.labSession.create({
        data: {
          userId: session.user.id,
          labId: lab.id,
          submittedFlag: submittedFlagHash,
          solved: isCorrect,
          attempts: 1,
          solvedAt: isCorrect ? new Date() : undefined,
        },
      })
    }

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
