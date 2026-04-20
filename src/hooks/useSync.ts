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
  const { setSchool, setStudents, addHistory, school, students, history } = useStore()
  const initialized = useRef(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load all data from DB on mount
  useEffect(() => {
    if (!user?.schoolId || initialized.current) return
    initialized.current = true

    const load = async () => {
      try {
        // Load school settings
        const sRes = await fetch(`/api/settings?schoolId=${user.schoolId}`, { credentials: 'include' })
        if (sRes.ok) {
          const data = await sRes.json()
          if (data) setSchool(toStoreSchool(data))
        }

        // Load students
        const stRes = await fetch(`/api/students?schoolId=${user.schoolId}`, { credentials: 'include' })
        if (stRes.ok) {
          const data = await stRes.json()
          if (Array.isArray(data)) setStudents(data.map(toStoreStudent))
        }

        // Load history
        const hRes = await fetch(`/api/generate?schoolId=${user.schoolId}`, { credentials: 'include' })
        if (hRes.ok) {
          const data = await hRes.json()
          if (Array.isArray(data)) {
            // Only add entries not already in store
            data.forEach((entry: Record<string, unknown>) => {
              addHistory(toStoreHistory(entry))
            })
          }
        }
      } catch (e) {
        console.error('[useSync] load error', e)
      }
    }

    load()
  }, [user?.schoolId, setSchool, setStudents, addHistory])

  // Save school settings to DB (debounced)
  const saveSchool = useCallback(async () => {
    if (!user?.schoolId) return
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...school, id: user.schoolId }),
      })
    } catch (e) {
      console.error('[useSync] saveSchool error', e)
    }
  }, [school, user?.schoolId])

  // Save students to DB (debounced)
  const saveStudents = useCallback(async () => {
    if (!user?.schoolId || students.length === 0) return
    try {
      await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ schoolId: user.schoolId, students }),
      })
    } catch (e) {
      console.error('[useSync] saveStudents error', e)
    }
  }, [students, user?.schoolId])

  // Auto-save school on change (debounced 1.5s)
  useEffect(() => {
    if (!user?.schoolId || !initialized.current) return
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(saveSchool, 1500)
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }
  }, [school, saveSchool, user?.schoolId])

  // Auto-save students on change (debounced 2s)
  useEffect(() => {
    if (!user?.schoolId || !initialized.current) return
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(saveStudents, 2000)
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }
  }, [students, saveStudents, user?.schoolId])

  return { saveSchool, saveStudents }
}
