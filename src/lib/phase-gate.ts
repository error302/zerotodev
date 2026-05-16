import { db } from "@/lib/db"

export interface PhaseGateResult {
  canAdvance: boolean
  blockedBy: string[]
  lessonProgress: { completed: number; total: number }
  exerciseProgress: { passed: number; total: number }
  assessmentPassed: boolean
  hasPortfolioArtifact: boolean
}

export async function checkPhaseGate(userId: string, phaseNumber: number): Promise<PhaseGateResult> {
  const blockedBy: string[] = []

  // Get lessons in this phase
  const lessons = await db.lesson.findMany({
    where: { phase: { number: phaseNumber } },
    include: { exercises: true },
  })

  const totalLessons = lessons.length
  if (totalLessons === 0) {
    return {
      canAdvance: false,
      blockedBy: ["No lessons found for this phase"],
      lessonProgress: { completed: 0, total: 0 },
      exerciseProgress: { passed: 0, total: 0 },
      assessmentPassed: false,
      hasPortfolioArtifact: false,
    }
  }

  const lessonIds = lessons.map((l) => l.id)
  const exerciseIds = lessons.flatMap((l) => l.exercises.map((e) => e.id))
  const totalExercises = exerciseIds.length

  // Check lesson completion
  const completedLessons = await db.userProgress.count({
    where: { userId, lessonId: { in: lessonIds }, completed: true },
  })

  if (completedLessons < totalLessons) {
    blockedBy.push(`Complete all ${totalLessons} lessons (${completedLessons}/${totalLessons} done)`)
  }

  // Check exercise completion
  const passedExercises = await db.userExerciseAttempt.count({
    where: { userId, exerciseId: { in: exerciseIds }, passed: true },
    distinct: ["exerciseId"],
  })

  if (passedExercises < totalExercises) {
    blockedBy.push(`Pass all ${totalExercises} exercises (${passedExercises}/${totalExercises} done)`)
  }

  // Check assessment
  const assessment = await db.assessment.findFirst({
    where: { phaseNumber, isRequired: true },
  })

  let assessmentPassed = true
  if (assessment) {
    const attempt = await db.assessmentAttempt.findUnique({
      where: { userId_assessmentId: { userId, assessmentId: assessment.id } },
    })
    assessmentPassed = !!attempt?.passed
    if (!assessmentPassed) {
      blockedBy.push(`Pass the "${assessment.title}" assessment`)
    }
  }

  // Check portfolio artifact
  const hasArtifact = await db.portfolioArtifact.count({
    where: { userId, type: { in: ["project", "exercise", "lab"] } },
  }) > 0

  if (!hasArtifact) {
    blockedBy.push("Complete at least one project, exercise, or lab for your portfolio")
  }

  return {
    canAdvance: blockedBy.length === 0,
    blockedBy,
    lessonProgress: { completed: completedLessons, total: totalLessons },
    exerciseProgress: { passed: passedExercises, total: totalExercises },
    assessmentPassed,
    hasPortfolioArtifact: hasArtifact,
  }
}

export async function checkAllPhaseGates(userId: string, totalPhases: number): Promise<Record<number, PhaseGateResult>> {
  const results: Record<number, PhaseGateResult> = {}
  for (let i = 1; i <= totalPhases; i++) {
    results[i] = await checkPhaseGate(userId, i)
  }
  return results
}
