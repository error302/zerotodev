import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

interface PistonRequest {
  language: string
  version: string
  files: Array<{ content: string }>
  stdin: string
}

interface PistonResponse {
  run?: {
    stdout: string
    stderr: string
    code: number
    signal: string | null
  }
  message?: string
}

interface TestCaseResult {
  testCaseId: string
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  isHidden: boolean
}

const languageMap: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.12.1" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "cpp", version: "10.2.0" },
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  java: { language: "java", version: "15.0.2" },
  rust: { language: "rust", version: "1.68.2" },
  go: { language: "go", version: "1.16.2" },
  bash: { language: "bash", version: "5.2.0" },
}

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

    const limit = rateLimit(`execute:${session.user.id}`, { windowMs: 60 * 1000, max: 30 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many code executions. Please wait before trying again." },
        { status: 429 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { code, exerciseId } = body

    if (!code || !exerciseId) {
      return NextResponse.json(
        { error: "Code and exerciseId are required" },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length > 50000) {
      return NextResponse.json(
        { error: "Code must be a string under 50KB" },
        { status: 400 }
      )
    }

    if (exerciseId !== id) {
      return NextResponse.json(
        { error: "Exercise ID mismatch" },
        { status: 400 }
      )
    }

    const exercise = await db.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        testCases: {
          orderBy: { order: "asc" },
        },
        lesson: true,
      },
    })

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      )
    }

    const lastAttempt = await db.userExerciseAttempt.findFirst({
      where: {
        userId: session.user.id,
        exerciseId: exercise.id,
      },
      orderBy: { attemptNum: "desc" },
    })
    const attemptNum = (lastAttempt?.attemptNum ?? 0) + 1

    // Prevent XP double-awarding: if user already passed this exercise, skip XP
    const alreadyPassed = lastAttempt?.passed === true

    const langConfig = languageMap[exercise.language] ?? languageMap.python
    const testCaseResults: TestCaseResult[] = []
    let allPassed = true

    for (const testCase of exercise.testCases) {
      const pistonRequest: PistonRequest = {
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
        stdin: testCase.input,
      }

      try {
        const pistonResponse = await fetch(
          "https://emkc.org/api/v2/piston/execute",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pistonRequest),
            signal: AbortSignal.timeout(15000),
          }
        )

        if (!pistonResponse.ok) {
          testCaseResults.push({
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "Error: Code execution service unavailable",
            passed: false,
            isHidden: testCase.isHidden,
          })
          allPassed = false
          continue
        }

        const pistonData: PistonResponse = await pistonResponse.json()

        if (pistonData.message) {
          testCaseResults.push({
            testCaseId: testCase.id,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: `Execution error: ${pistonData.message}`,
            passed: false,
            isHidden: testCase.isHidden,
          })
          allPassed = false
          continue
        }

        const actualOutput = (pistonData.run?.stdout ?? "").trim()
        const expectedOutput = testCase.expectedOutput.trim()
        const passed = actualOutput === expectedOutput

        if (!passed) allPassed = false

        testCaseResults.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          passed,
          isHidden: testCase.isHidden,
        })
      } catch {
        testCaseResults.push({
          testCaseId: testCase.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "Error: Failed to execute code",
          passed: false,
          isHidden: testCase.isHidden,
        })
        allPassed = false
      }
    }

    const combinedOutput = testCaseResults
      .map((r) => `Test ${r.testCaseId}: ${r.passed ? "PASS" : "FAIL"}`)
      .join("\n")

    await db.userExerciseAttempt.create({
      data: {
        userId: session.user.id,
        exerciseId: exercise.id,
        code,
        passed: allPassed,
        output: combinedOutput,
        attemptNum,
        hintsUsed: 0,
      },
    })

    // Only award XP if all tests pass AND user hasn't already earned XP for this exercise
    if (allPassed && !alreadyPassed) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          xpTotal: { increment: exercise.xpReward },
          lastActiveAt: new Date(),
        },
      })

      const exerciseIds = (await db.exercise.findMany({
        where: { lessonId: exercise.lessonId },
        select: { id: true },
      })).map((e) => e.id)

      const passedAttempts = await db.userExerciseAttempt.findMany({
        where: {
          userId: session.user.id,
          exerciseId: { in: exerciseIds },
          passed: true,
        },
        distinct: ["exerciseId"],
      })

      if (passedAttempts.length === exerciseIds.length) {
        await db.userProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId: exercise.lessonId,
            },
          },
          create: {
            userId: session.user.id,
            lessonId: exercise.lessonId,
            completed: true,
            completedAt: new Date(),
            hintsUsed: 0,
          },
          update: {
            completed: true,
            completedAt: new Date(),
          },
        })

        await db.user.update({
          where: { id: session.user.id },
          data: {
            xpTotal: { increment: exercise.lesson.xpReward },
          },
        })
      }
    }

    const responseResults = testCaseResults.map((r) => ({
      testCaseId: r.testCaseId,
      passed: r.passed,
      isHidden: r.isHidden,
      input: r.isHidden ? "[hidden]" : r.input,
      expectedOutput: r.isHidden ? "[hidden]" : r.expectedOutput,
      actualOutput: r.isHidden && r.passed ? "[hidden]" : r.actualOutput,
    }))

    return NextResponse.json({
      exerciseId: exercise.id,
      attemptNum,
      passed: allPassed,
      xpEarned: (allPassed && !alreadyPassed) ? exercise.xpReward : 0,
      alreadyCompleted: alreadyPassed,
      totalTestCases: testCaseResults.length,
      passedTestCases: testCaseResults.filter((r) => r.passed).length,
      results: responseResults,
    })
  } catch (error) {
    console.error("Exercise submit API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
