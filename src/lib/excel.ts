import * as XLSX from 'xlsx'
import type { ColumnMapping, Student, ValidationError } from '@/types'
import { nanoid } from './utils'

export function parseExcelHeaders(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
        const headers = json.length > 0 ? Object.keys(json[0]) : []
        resolve({ headers, rows: json })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function mapRowsToStudents(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  schoolId: string
): Student[] {
  return rows.map((row) => ({
    id: nanoid(),
    schoolId,
    matricule: String(row[mapping.matricule] ?? '').trim(),
    nom: String(row[mapping.nom] ?? '').trim(),
    prenoms: String(row[mapping.prenoms] ?? '').trim(),
    neLe: String(row[mapping.neLe] ?? '').trim(),
    lieuNaissance: String(row[mapping.lieuNaissance] ?? '').trim(),
    nationalite: String(row[mapping.nationalite] ?? '').trim(),
    sexe: (String(row[mapping.sexe] ?? 'M').trim().toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F',
    classe: String(row[mapping.classe] ?? '').trim(),
    tel: mapping.tel ? String(row[mapping.tel] ?? '').trim() : undefined,
    photoUrl: mapping.photo ? String(row[mapping.photo] ?? '').trim() : undefined,
  }))
}

export function validateStudents(students: Student[]): ValidationError[] {
  const errors: ValidationError[] = []
  const matricules = new Map<string, number>()

  students.forEach((s, i) => {
    const required: (keyof Student)[] = ['matricule', 'nom', 'prenoms', 'neLe', 'classe']
    required.forEach((field) => {
      if (!s[field]) {
        errors.push({
          type: 'missing_field',
          message: `Ligne ${i + 2} : champ "${field}" manquant`,
          studentId: s.id,
        })
      }
    })

    if (s.matricule) {
      matricules.set(s.matricule, (matricules.get(s.matricule) ?? 0) + 1)
    }

    if (!s.photoUrl) {
      errors.push({
        type: 'missing_photo',
        message: `Photo manquante pour ${s.nom} ${s.prenoms} (${s.matricule})`,
        studentId: s.id,
        matricule: s.matricule,
      })
    }
  })

  matricules.forEach((count, matricule) => {
    if (count > 1) {
      errors.push({
        type: 'duplicate_matricule',
        message: `Matricule dupliqué : ${matricule} (${count} fois)`,
        matricule,
      })
    }
  })

  return errors
}
