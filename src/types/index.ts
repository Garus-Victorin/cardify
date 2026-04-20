export interface Student {
  id: string
  matricule: string
  nom: string
  prenoms: string
  neLe: string
  lieuNaissance: string
  nationalite: string
  sexe: 'M' | 'F'
  classe: string
  tel?: string
  photoUrl?: string
  photoFile?: File
  schoolId: string
}

export interface School {
  id: string
  name: string
  adresse?: string
  lieu?: string
  telephone?: string
  logoUrl?: string
  flagUrl?: string
  signatureUrl?: string
  anneeScolaire: string
  dateCarteLabel: string
  themeColor: string
  plan: 'free' | 'premium'
  studentCount: number
}

export interface ColumnMapping {
  matricule: string
  nom: string
  prenoms: string
  neLe: string
  lieuNaissance: string
  nationalite: string
  sexe: string
  classe: string
  tel?: string
  photo?: string
}

export interface ValidationError {
  type: 'missing_photo' | 'duplicate_matricule' | 'missing_field'
  message: string
  studentId?: string
  matricule?: string
}

export interface GenerationHistory {
  id: string
  schoolId: string
  createdAt: string
  studentCount: number
  pdfUrl?: string
  filters?: { classe?: string }
}

export type UserRole = 'admin' | 'secretaire' | 'viewer'

export interface User {
  id: string
  email: string
  role: UserRole
  schoolId: string
  name: string
}
