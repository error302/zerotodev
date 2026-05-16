import { NextRequest, NextResponse } from 'next/server'
import YAML from 'yaml'
import { db } from '@/lib/db'

// Admin-only POST endpoint to import a challenge from YAML content
export async function POST(request: NextRequest) {
  try {
    // Get the YAML content from the request body
    const yamlContent = await request.text()

    if (!yamlContent || yamlContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'YAML content is required in the request body' },
        { status: 400 }
      )
    }

    // Parse the YAML content
    let parsed: Record<string, unknown>
    try {
      parsed = YAML.parse(yamlContent) as Record<string, unknown>
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid YAML format', details: String(parseError) },
        { status: 400 }
      )
    }

    // Validate required fields
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

    // Validate field types and values
    const errors: string[] = []

    // Validate slug format (lowercase, hyphens, no spaces)
    const slug = parsed.slug as string
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Slug must be lowercase with hyphens only (e.g., "my-challenge")')
    }

    // Validate phase (1-6)
    const phase = Number(parsed.phase)
    if (!Number.isInteger(phase) || phase < 1 || phase > 6) {
      errors.push('Phase must be an integer between 1 and 6')
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard', 'expert']
    const difficulty = parsed.difficulty as string
    if (!validDifficulties.includes(difficulty)) {
      errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`)
    }

    // Validate category
    const validCategories = ['web', 'crypto', 'forensics', 'reversing', 'pwn', 'encoding', 'scripting', 'binary']
    const category = parsed.category as string
    if (!validCategories.includes(category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`)
    }

    // Validate expected_flag format (ZTD{...})
    const expectedFlag = parsed.expected_flag as string
    if (!/^ZTD\{[a-zA-Z0-9_-]+\}$/.test(expectedFlag)) {
      errors.push('Expected flag must follow ZTD{...} format with alphanumeric content')
    }

    // Validate xp_reward is a positive integer
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

    // Check for slug uniqueness
    const existingLab = await db.hackingLab.findUnique({
      where: { slug }
    })

    if (existingLab) {
      return NextResponse.json(
        { error: `A lab with slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    // Determine the order (max existing order for the phase + 1)
    const maxOrderLab = await db.hackingLab.findFirst({
      where: { phase },
      orderBy: { order: 'desc' },
      select: { order: true }
    })
    const nextOrder = (maxOrderLab?.order ?? 0) + 1

    // Create the HackingLab record
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
          expectedFlag: lab.expectedFlag,
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
