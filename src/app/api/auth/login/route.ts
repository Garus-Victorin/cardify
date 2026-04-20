import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/lib/validators'
import { signToken, getSessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })

    // Generic error to prevent email enumeration
    if (!user) {
      await bcrypt.hash(password, 12) // timing attack prevention
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Sign JWT
    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
      schoolId: user.schoolId ?? 'school-1',
    })

    const response = NextResponse.json({
      message: 'Connexion reussie',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })

    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions())

    return response
  } catch (error) {
    console.error('[LOGIN]', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez reessayer.' },
      { status: 500 }
    )
  }
}
