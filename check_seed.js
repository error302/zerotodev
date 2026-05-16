const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  const tracks = await db.languageTrack.count();
  const certs = await db.certification.count();
  const certProjs = await db.certificationProject.count();
  const ip = await db.interviewProblem.count();
  console.log('Language tracks:', tracks);
  console.log('Certifications:', certs);
  console.log('Certification projects:', certProjs);
  console.log('Interview problems:', ip);
  await db.$disconnect();
})();
