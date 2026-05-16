import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown"
    const limit = rateLimit(`register:${ip}`, { windowMs: 10 * 60 * 1000, max: 5 })
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, username, password } = body

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordStrength.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 }
      )
    }

    const existingEmail = await db.user.findUnique({
      where: { email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const existingUsername = await db.user.findUnique({
      where: { username },
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        username,
        passwordHash,
        xpTotal: 100,
        currentPhase: 1,
        streak: 0,
        role: "student",
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        xpTotal: user.xpTotal,
        currentPhase: user.currentPhase,
        role: user.role,
        createdAt: user.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
