import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET — list all projects for the school
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const schoolId = session.schoolId
  const projectId = req.nextUrl.searchParams.get('id')

  // Load a specific project with its students
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, schoolId },
    })
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

    // Load students linked to this project via a snapshot stored in the project name tag
    const students = await prisma.student.findMany({
      where: { schoolId, projectId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ project, students })
  }

  // List all projects
  const projects = await prisma.project.findMany({
    where: { schoolId },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(projects)
}

// POST — save current students as a named project
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  try {
    const { name, description, students } = await req.json()
    const schoolId = session.schoolId

    if (!name?.trim()) return NextResponse.json({ error: 'Nom du projet requis' }, { status: 400 })
    if (!Array.isArray(students) || students.length === 0) return NextResponse.json({ error: 'Aucun eleve a sauvegarder' }, { status: 400 })

    // Ensure school exists
    await prisma.school.upsert({
      where: { id: schoolId },
      update: {},
      create: { id: schoolId, name: 'Mon Ecole' },
    })

    // Create project
    const project = await prisma.project.create({
      data: {
        schoolId,
        name: name.trim(),
        description: description?.trim() || null,
        studentCount: students.length,
      },
    })

    // Save students linked to this project
    await prisma.student.createMany({
      data: students.map((s: {
        id: string; matricule: string; nom: string; prenoms: string
        neLe: string; lieuNaissance: string; nationalite: string
        sexe: 'M' | 'F'; classe: string; tel?: string; photoUrl?: string
      }) => ({
        id: undefined, // let DB generate new IDs for project snapshot
        matricule: s.matricule || 'N/A',
        nom: s.nom || 'N/A',
        prenoms: s.prenoms || '',
        neLe: s.neLe || '',
        lieuNaissance: s.lieuNaissance || '',
        nationalite: s.nationalite || '',
        sexe: (String(s.sexe ?? 'M').toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F',
        classe: s.classe || '',
        tel: s.tel?.trim() || null,
        photoUrl: s.photoUrl?.trim() || null,
        schoolId,
        projectId: project.id,
      })),
      skipDuplicates: false,
    })

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('[PROJECTS POST]', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE — delete a project and its snapshot students
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const { projectId } = await req.json()
  if (!projectId) return NextResponse.json({ error: 'projectId requis' }, { status: 400 })

  await prisma.student.deleteMany({ where: { projectId, schoolId: session.schoolId } })
  await prisma.project.delete({ where: { id: projectId, schoolId: session.schoolId } })

  return NextResponse.json({ success: true })
}
