import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const limit = rateLimit(`interview:${session.user.id}`, { windowMs: 60 * 1000, max: 20 })
    if (!limit.allowed) return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 })

    const { slug } = await params
    const body = await request.json()
    const { code, timeSpent, hintsUsed } = body
    if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 })

    const problem = await db.interviewProblem.findUnique({ where: { slug } })
    if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 })

    const testCases: Array<{ input: string; expectedOutput: string; hidden?: boolean }> = JSON.parse(problem.testCases)
    let allPassed = true
    const results: Array<{ passed: boolean; isHidden: boolean }> = []

    for (const tc of testCases) {
      try {
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language: problem.language, version: problem.language === "python" ? "3.12.1" : "10.2.0", files: [{ content: code }], stdin: tc.input }),
          signal: AbortSignal.timeout(10000),
        })
        const data = await res.json()
        const actualOutput = (data.run?.stdout ?? "").trim()
        const passed = actualOutput === tc.expectedOutput.trim()
        if (!passed) allPassed = false
        results.push({ passed, isHidden: tc.hidden ?? false })
      } catch {
        allPassed = false
        results.push({ passed: false, isHidden: tc.hidden ?? false })
      }
    }

    const lastAttempt = await db.interviewAttempt.findFirst({
      where: { userId: session.user.id, problemId: problem.id },
      orderBy: { attemptNum: "desc" },
    })
    const attemptNum = (lastAttempt?.attemptNum ?? 0) + 1

    await db.interviewAttempt.create({
      data: { userId: session.user.id, problemId: problem.id, code, passed: allPassed, timeSpent: timeSpent ?? 0, hintsUsed: hintsUsed ?? 0, attemptNum },
    })

    if (allPassed && !lastAttempt?.passed) {
      await db.user.update({ where: { id: session.user.id }, data: { xpTotal: { increment: problem.xpReward }, lastActiveAt: new Date() } })
    }

    return NextResponse.json({ passed: allPassed, xpEarned: allPassed && !lastAttempt?.passed ? problem.xpReward : 0, results })
  } catch (error) {
    console.error("Interview submit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
