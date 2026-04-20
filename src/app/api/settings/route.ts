import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const schoolId = req.nextUrl.searchParams.get('schoolId') ?? session.schoolId
  if (!schoolId) return NextResponse.json({ error: 'schoolId requis' }, { status: 400 })

  const school = await prisma.school.findUnique({ where: { id: schoolId } })
  return NextResponse.json(school)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const body = await req.json()
  const { id, plan, studentCount, createdAt, updatedAt, ...data } = body
  const schoolId = id ?? session.schoolId

  if (!schoolId) return NextResponse.json({ error: 'schoolId requis' }, { status: 400 })

  const school = await prisma.school.upsert({
    where: { id: schoolId },
    update: data,
    create: { id: schoolId, name: data.name ?? 'Mon Ecole', ...data },
  })

  return NextResponse.json(school)
}
