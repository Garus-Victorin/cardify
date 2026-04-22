import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, signToken, getSessionCookieOptions } from '@/lib/auth'

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { name } = await req.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    }

    // Update user in DB
    const user = await prisma.user.update({
      where: { id: session.sub },
      data: { name: name.trim() },
    })

    // Generate new token with updated name
    const token = await signToken({
      sub: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role,
      schoolId: user.schoolId ?? '',
    })

    const response = NextResponse.json({ success: true, user })
    const cookieOpts = getSessionCookieOptions()
    response.cookies.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      maxAge: cookieOpts.maxAge,
      path: cookieOpts.path,
    })

    return response
  } catch (error) {
    console.error('[PROFILE PUT]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
