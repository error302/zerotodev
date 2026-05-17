import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const session = await getServerSession(authOptions)
    const cert = await db.certification.findUnique({
      where: { slug, isActive: true },
      include: {
        projects: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!cert) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    let userCert: any = null
    if (session?.user?.id) {
      userCert = await db.userCertification.findUnique({
        where: {
          userId_certificationId: {
            userId: session.user.id,
            certificationId: cert.id,
          },
        },
      })
    }

    const projects = cert.projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      requirements: JSON.parse(p.requirements) as string[],
      starterCode: p.starterCode,
      language: p.language,
      order: p.order,
      completed: userCert ? JSON.parse(userCert.projects).includes(p.id) : false,
    }))

    return NextResponse.json({
      certification: {
        id: cert.id,
        slug: cert.slug,
        title: cert.title,
        description: cert.description,
        icon: cert.icon,
        requiredProjects: cert.requiredProjects,
        estimatedHours: cert.estimatedHours,
        projects,
        userCert,
      },
    })
  } catch (error) {
    console.error("Certification detail API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const cert = await db.certification.findUnique({
      where: { slug },
      include: { projects: true },
    })

    if (!cert) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 })
    }

    const body = await request.json()
    const { projectId, submission } = body

    const project = cert.projects.find((p) => p.id === projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    let userCert = await db.userCertification.findUnique({
      where: {
        userId_certificationId: {
          userId: session.user.id,
          certificationId: cert.id,
        },
      },
    })

    let completedProjects: string[] = userCert
      ? JSON.parse(userCert.projects)
      : []

    if (!completedProjects.includes(projectId)) {
      completedProjects.push(projectId)
    }

    userCert = await db.userCertification.upsert({
      where: {
        userId_certificationId: {
          userId: session.user.id,
          certificationId: cert.id,
        },
      },
      create: {
        userId: session.user.id,
        certificationId: cert.id,
        projects: JSON.stringify(completedProjects),
        completedAt: new Date(),
      },
      update: {
        projects: JSON.stringify(completedProjects),
        completedAt: completedProjects.length >= cert.requiredProjects ? new Date() : undefined,
      },
    })

    return NextResponse.json({
      userCert,
      completedCount: completedProjects.length,
      requiredCount: cert.requiredProjects,
      isComplete: completedProjects.length >= cert.requiredProjects,
    })
  } catch (error) {
    console.error("Certification submission API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
