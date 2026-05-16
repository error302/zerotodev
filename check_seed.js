const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const ip = await db.interviewProblem.count();
  const a = await db.assessment.count();
  const pa = await db.portfolioArtifact.count();
  console.log('Interview problems:', ip);
  console.log('Assessments:', a);
  console.log('Portfolio artifacts:', pa);
  await db.$disconnect();
})();
