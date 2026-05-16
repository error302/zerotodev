import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const { code, exerciseId } = body

    if (!code || !exerciseId) {
      return NextResponse.json(
        { error: "Code and exerciseId are required" },
        { status: 400 }
      )
    }

    if (exerciseId !== id) {
      return NextResponse.json(
        { error: "Exercise ID mismatch" },
        { status: 400 }
      )
    }

    // Get the exercise with its test cases
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

    // Get the current attempt number
    const lastAttempt = await db.userExerciseAttempt.findFirst({
      where: {
        userId: session.user.id,
        exerciseId: exercise.id,
      },
      orderBy: { attemptNum: "desc" },
    })
    const attemptNum = (lastAttempt?.attemptNum ?? 0) + 1

    // Run code against each test case using Piston API
    const testCaseResults: TestCaseResult[] = []
    let allPassed = true

    for (const testCase of exercise.testCases) {
      const pistonRequest: PistonRequest = {
        language: "python",
        version: "3.12.1",
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

    // Build combined output for the attempt record
    const combinedOutput = testCaseResults
      .map((r) => `Test ${r.testCaseId}: ${r.passed ? "PASS" : "FAIL"}`)
      .join("\n")

    // Record the attempt
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

    // If all test cases pass, award XP and mark progress
    if (allPassed) {
      // Award XP to user
      await db.user.update({
        where: { id: session.user.id },
        data: {
          xpTotal: { increment: exercise.xpReward },
          lastActiveAt: new Date(),
        },
      })

      // Check if all exercises in this lesson are now completed
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

      // If all exercises in the lesson have been completed, mark lesson progress
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

        // Also award the lesson XP
        await db.user.update({
          where: { id: session.user.id },
          data: {
            xpTotal: { increment: exercise.lesson.xpReward },
          },
        })
      }
    }

    // Prepare response (hide expected output and input for hidden test cases)
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
      xpEarned: allPassed ? exercise.xpReward : 0,
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
