import * as XLSX from 'xlsx'
import type { ColumnMapping, Student, ValidationError } from '@/types'
import { nanoid } from './utils'

function formatCellValue(v: unknown): string {
  if (v instanceof Date) {
    const d = String(v.getDate()).padStart(2, '0')
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const y = v.getFullYear()
    return `${d}/${m}/${y}`
  }
  return String(v ?? '')
}

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function parseExcelHeaders(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
        const headers = json.length > 0 ? Object.keys(json[0]) : []
        const rows = json.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, formatCellValue(v)])
          )
        )
        resolve({ headers, rows })
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
    prenoms: mapping.prenoms ? String(row[mapping.prenoms] ?? '').trim() : '',
    neLe: mapping.neLe ? String(row[mapping.neLe] ?? '').trim() : '',
    lieuNaissance: mapping.lieuNaissance ? capitalize(String(row[mapping.lieuNaissance] ?? '').trim()) : '',
    nationalite: mapping.nationalite ? capitalize(String(row[mapping.nationalite] ?? '').trim()) : '',
    sexe: mapping.sexe
      ? (String(row[mapping.sexe] ?? 'M').trim().toUpperCase() === 'F' ? 'F' : 'M') as 'M' | 'F'
      : 'M',
    classe: mapping.classe ? String(row[mapping.classe] ?? '').trim() : '',
    tel: mapping.tel ? String(row[mapping.tel] ?? '').trim() || undefined : undefined,
    photoUrl: mapping.photo ? String(row[mapping.photo] ?? '').trim() || undefined : undefined,
  }))
}

export function validateStudents(students: Student[]): ValidationError[] {
  const errors: ValidationError[] = []
  const matricules = new Map<string, number>()

  students.forEach((s, i) => {
    // Only matricule and nom are truly required
    const required: (keyof Student)[] = ['matricule', 'nom']
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
  })

  matricules.forEach((count, matricule) => {
    if (count > 1) {
      errors.push({
        type: 'duplicate_matricule',
        message: `Matricule duplique : ${matricule} (${count} fois)`,
        matricule,
      })
    }
  })

  return errors
}
