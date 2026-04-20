import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validators'
import { signToken, getSessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password, name } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Un compte avec cet email existe deja' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Create school first
    const school = await prisma.school.create({
      data: {
        name: name ? `Ecole de ${name}` : 'Mon Etablissement',
        anneeScolaire: '2024-2025',
        dateCarteLabel: 'Septembre 2024',
        themeColor: '#1e3a5f',
      },
    })

    // Then create user linked to school
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name ?? null,
        role: 'ADMIN',
        schoolId: school.id,
      },
      select: { id: true, email: true, name: true, role: true, schoolId: true },
    })

    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
      schoolId: user.schoolId!,
    })

    const response = NextResponse.json(
      { message: 'Compte cree avec succes', user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    )
    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions())
    return response

  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez reessayer.' }, { status: 500 })
  }
}
