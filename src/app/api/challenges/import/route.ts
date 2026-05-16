import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import YAML from 'yaml'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const yamlContent = await request.text()

    if (!yamlContent || yamlContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'YAML content is required in the request body' },
        { status: 400 }
      )
    }

    let parsed: Record<string, unknown>
    try {
      parsed = YAML.parse(yamlContent) as Record<string, unknown>
    } catch {
      return NextResponse.json(
        { error: 'Invalid YAML format' },
        { status: 400 }
      )
    }

    const requiredFields = [
      'title', 'slug', 'phase', 'difficulty', 'category',
      'expected_flag', 'description', 'briefing', 'setup',
      'tools_hint', 'xp_reward', 'author'
    ]

    const missingFields = requiredFields.filter(field => !parsed[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const errors: string[] = []

    const slug = parsed.slug as string
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Slug must be lowercase with hyphens only (e.g., "my-challenge")')
    }

    const phase = Number(parsed.phase)
    if (!Number.isInteger(phase) || phase < 1 || phase > 6) {
      errors.push('Phase must be an integer between 1 and 6')
    }

    const validDifficulties = ['easy', 'medium', 'hard', 'expert']
    const difficulty = parsed.difficulty as string
    if (!validDifficulties.includes(difficulty)) {
      errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`)
    }

    const validCategories = ['web', 'crypto', 'forensics', 'reversing', 'pwn', 'encoding', 'scripting', 'binary']
    const category = parsed.category as string
    if (!validCategories.includes(category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`)
    }

    const expectedFlag = parsed.expected_flag as string
    if (!/^ZTD\{[a-zA-Z0-9_-]+\}$/.test(expectedFlag)) {
      errors.push('Expected flag must follow ZTD{...} format with alphanumeric content')
    }

    const xpReward = Number(parsed.xp_reward)
    if (!Number.isInteger(xpReward) || xpReward <= 0) {
      errors.push('XP reward must be a positive integer')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const existingLab = await db.hackingLab.findUnique({
      where: { slug }
    })

    if (existingLab) {
      return NextResponse.json(
        { error: `A lab with slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    const maxOrderLab = await db.hackingLab.findFirst({
      where: { phase },
      orderBy: { order: 'desc' },
      select: { order: true }
    })
    const nextOrder = (maxOrderLab?.order ?? 0) + 1

    const lab = await db.hackingLab.create({
      data: {
        title: parsed.title as string,
        slug,
        description: parsed.description as string,
        phase,
        difficulty,
        category,
        expectedFlag,
        setupMdx: (parsed.setup as string) || '',
        toolsHint: (parsed.tools_hint as string) || '',
        briefingMdx: (parsed.briefing as string) || '',
        author: (parsed.author as string) || 'Anonymous',
        xpReward,
        hintContent: (parsed.hint as string) || null,
        order: nextOrder,
        isPublished: true,
      }
    })

    return NextResponse.json(
      {
        message: 'Challenge imported successfully',
        lab: {
          id: lab.id,
          title: lab.title,
          slug: lab.slug,
          phase: lab.phase,
          difficulty: lab.difficulty,
          category: lab.category,
          xpReward: lab.xpReward,
          author: lab.author,
          order: lab.order,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Challenge import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during challenge import' },
      { status: 500 }
    )
  }
}
