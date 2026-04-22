import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const schoolId = req.nextUrl.searchParams.get('schoolId') ?? session.schoolId
  if (!schoolId) return NextResponse.json([], { status: 200 })

  const students = await prisma.student.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  try {
    const { schoolId, students } = await req.json()
    if (!schoolId || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
    }

    // Create or get school (separate from transaction)
    const school = await prisma.school.upsert({
      where: { id: schoolId },
      update: {},
      create: { id: schoolId, name: 'Mon Ecole' },
    })

    // Delete existing students for this school then re-insert (separate operations)
    await prisma.student.deleteMany({ where: { schoolId } })

    const created = await prisma.student.createMany({
      data: students.map((s: {
        id: string; matricule: string; nom: string; prenoms: string
        neLe: string; lieuNaissance: string; nationalite: string
        sexe: 'M' | 'F'; classe: string; tel?: string; photoUrl?: string
      }) => ({
        id: s.id,
        matricule: s.matricule || 'N/A',
        nom: s.nom || 'N/A',
        prenoms: s.prenoms || 'N/A',
        neLe: s.neLe || '',
        lieuNaissance: s.lieuNaissance || '',
        nationalite: s.nationalite || '',
        sexe: (String(s.sexe ?? 'M').trim().toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F',
        classe: s.classe || '',
        tel: s.tel ? String(s.tel).trim() || null : null,
        photoUrl: s.photoUrl ? String(s.photoUrl).trim() || null : null,
        schoolId,
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error('[STUDENTS POST]', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { studentId } = await req.json()
  if (!studentId) return NextResponse.json({ error: 'studentId requis' }, { status: 400 })

  await prisma.student.delete({ where: { id: studentId } })
  return NextResponse.json({ success: true })
}
