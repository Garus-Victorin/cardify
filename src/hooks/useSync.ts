'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import { useAuth } from './useAuth'
import type { School, Student, GenerationHistory } from '@/types'

function toStoreSchool(db: Record<string, unknown>): Partial<School> {
  return {
    id: db.id as string,
    name: db.name as string,
    adresse: (db.adresse as string) ?? '',
    lieu: (db.lieu as string) ?? '',
    telephone: (db.telephone as string) ?? '',
    logoUrl: (db.logoUrl as string) ?? undefined,
    flagUrl: (db.flagUrl as string) ?? undefined,
    signatureUrl: (db.signatureUrl as string) ?? undefined,
    anneeScolaire: (db.anneeScolaire as string) ?? '2024-2025',
    dateCarteLabel: (db.dateCarteLabel as string) ?? 'Septembre 2024',
    themeColor: (db.themeColor as string) ?? '#1e3a5f',
    plan: (db.plan as string) === 'PREMIUM' ? 'premium' : 'free',
    studentCount: 0,
  }
}

function toStoreStudent(db: Record<string, unknown>): Student {
  return {
    id: db.id as string,
    matricule: db.matricule as string,
    nom: db.nom as string,
    prenoms: db.prenoms as string,
    neLe: db.neLe as string,
    lieuNaissance: db.lieuNaissance as string,
    nationalite: db.nationalite as string,
    sexe: db.sexe as 'M' | 'F',
    classe: db.classe as string,
    tel: (db.tel as string) ?? undefined,
    photoUrl: (db.photoUrl as string) ?? undefined,
    schoolId: db.schoolId as string,
  }
}

function toStoreHistory(db: Record<string, unknown>): GenerationHistory {
  return {
    id: db.id as string,
    schoolId: db.schoolId as string,
    createdAt: db.createdAt as string,
    studentCount: db.studentCount as number,
    filters: db.classeFilter ? { classe: db.classeFilter as string } : undefined,
  }
}

export function useSync() {
  const { user } = useAuth()
  const { setSchool, setStudents, addHistory, school, students } = useStore()
  const initialized = useRef(false)
  const schoolTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const studentsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load all data from DB on mount ──
  useEffect(() => {
    if (!user?.schoolId || initialized.current) return
    initialized.current = true

    const load = async () => {
      try {
        const [sRes, stRes, hRes] = await Promise.all([
          fetch(`/api/settings?schoolId=${user.schoolId}`, { credentials: 'include' }),
          fetch(`/api/students?schoolId=${user.schoolId}`, { credentials: 'include' }),
          fetch(`/api/generate?schoolId=${user.schoolId}`, { credentials: 'include' }),
        ])

        if (sRes.ok) {
          const data = await sRes.json()
          if (data) setSchool(toStoreSchool(data))
        }
        if (stRes.ok) {
          const data = await stRes.json()
          if (Array.isArray(data) && data.length > 0) setStudents(data.map(toStoreStudent))
        }
        if (hRes.ok) {
          const data = await hRes.json()
          if (Array.isArray(data)) {
            data.forEach((entry: Record<string, unknown>) => addHistory(toStoreHistory(entry)))
          }
        }
      } catch (e) {
        console.error('[useSync] load error', e)
      }
    }

    load()
  }, [user?.schoolId, setSchool, setStudents, addHistory])

  // ── Save school settings (debounced 1.5s) ──
  const saveSchool = useCallback(async (schoolId: string) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...school, id: schoolId }),
      })
    } catch (e) {
      console.error('[useSync] saveSchool error', e)
    }
  }, [school])

  // ── Save students (debounced 2s) ──
  const saveStudents = useCallback(async (schoolId: string) => {
    if (students.length === 0) return
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schoolId, students }),
      })
      if (!res.ok) {
        const text = await res.text()
        console.error('[useSync] saveStudents failed:', res.status, text)
      }
    } catch (e) {
      console.error('[useSync] saveStudents error', e)
    }
  }, [students])

  // Auto-save school
  useEffect(() => {
    if (!user?.schoolId || !initialized.current) return
    if (schoolTimeout.current) clearTimeout(schoolTimeout.current)
    schoolTimeout.current = setTimeout(() => saveSchool(user.schoolId), 1500)
    return () => { if (schoolTimeout.current) clearTimeout(schoolTimeout.current) }
  }, [school, saveSchool, user?.schoolId])

  // Auto-save students — DISABLED, only manual save to avoid race conditions
  // Students are saved explicitly when user navigates forward in the pipeline
  // useEffect(() => {
  //   if (!user?.schoolId || !initialized.current || students.length === 0) return
  //   if (studentsTimeout.current) clearTimeout(studentsTimeout.current)
  //   studentsTimeout.current = setTimeout(() => saveStudents(user.schoolId), 2000)
  //   return () => { if (studentsTimeout.current) clearTimeout(studentsTimeout.current) }
  // }, [students, saveStudents, user?.schoolId])

  return { saveSchool: () => user?.schoolId && saveSchool(user.schoolId), saveStudents: () => user?.schoolId && saveStudents(user.schoolId) }
}
