import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const schoolId = req.nextUrl.searchParams.get('schoolId') ?? session.schoolId
  if (!schoolId) return NextResponse.json([])

  const history = await prisma.generationHistory.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(history)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { schoolId, studentCount, classeFilter } = await req.json()
  if (!schoolId) return NextResponse.json({ error: 'schoolId requis' }, { status: 400 })

  // Ensure school exists
  await prisma.school.upsert({
    where: { id: schoolId },
    update: {},
    create: { id: schoolId, name: 'Mon Ecole' },
  })

  const entry = await prisma.generationHistory.create({
    data: { schoolId, studentCount, classeFilter: classeFilter ?? null },
  })

  return NextResponse.json(entry)
}
