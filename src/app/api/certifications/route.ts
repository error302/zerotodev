import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const certifications = await db.certification.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        projects: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, language: true, order: true },
        },
      },
    })

    let userCerts: Record<string, { completedAt: Date; projects: string[] }> = {}
    if (session?.user?.id) {
      const earned = await db.userCertification.findMany({
        where: { userId: session.user.id },
      })
      for (const c of earned) {
        userCerts[c.certificationId] = {
          completedAt: c.completedAt,
          projects: JSON.parse(c.projects),
        }
      }
    }

    const result = certifications.map((cert) => ({
      id: cert.id,
      slug: cert.slug,
      title: cert.title,
      description: cert.description,
      icon: cert.icon,
      requiredProjects: cert.requiredProjects,
      estimatedHours: cert.estimatedHours,
      order: cert.order,
      projectCount: cert.projects.length,
      userCert: userCerts[cert.id] || null,
    }))

    return NextResponse.json({ certifications: result })
  } catch (error) {
    console.error("Certifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
