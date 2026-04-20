import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Student, School, ColumnMapping, ValidationError, GenerationHistory } from '@/types'

interface CardifyStore {
  // School
  school: School
  setSchool: (school: Partial<School>) => void

  // Students
  students: Student[]
  setStudents: (students: Student[]) => void
  updateStudentPhoto: (id: string, photoUrl: string) => void

  // Column mapping
  columnMapping: ColumnMapping | null
  setColumnMapping: (mapping: ColumnMapping) => void
  rawHeaders: string[]
  setRawHeaders: (headers: string[]) => void

  // Validation
  validationErrors: ValidationError[]
  setValidationErrors: (errors: ValidationError[]) => void

  // UI state
  activeStep: number
  setActiveStep: (step: number) => void
  importMode: 'excel' | 'form' | null
  setImportMode: (mode: 'excel' | 'form' | null) => void
  selectedClasse: string
  setSelectedClasse: (classe: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  generationProgress: number
  setGenerationProgress: (v: number) => void

  // History
  history: GenerationHistory[]
  addHistory: (entry: GenerationHistory) => void

  // Reset
  reset: () => void
}

const defaultSchool: School = {
  id: 'school-1',
  name: 'COMPLEXE SCOLAIRE GLORIA DEI',
  adresse: '',
  lieu: '',
  telephone: '',
  anneeScolaire: '2024-2025',
  dateCarteLabel: 'Septembre 2024',
  themeColor: '#1e3a5f',
  plan: 'free',
  studentCount: 0,
}

export const useStore = create<CardifyStore>()(
  persist(
    (set) => ({
      school: defaultSchool,
      setSchool: (s) => set((state) => ({ school: { ...state.school, ...s } })),

      students: [],
      setStudents: (students) => set({ students }),
      updateStudentPhoto: (id, photoUrl) =>
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, photoUrl } : s)),
        })),

      columnMapping: null,
      setColumnMapping: (mapping) => set({ columnMapping: mapping }),
      rawHeaders: [],
      setRawHeaders: (headers) => set({ rawHeaders: headers }),

      validationErrors: [],
      setValidationErrors: (errors) => set({ validationErrors: errors }),

      activeStep: 0,
      setActiveStep: (step) => set({ activeStep: step }),
      importMode: null,
      setImportMode: (mode) => set({ importMode: mode }),
      selectedClasse: '',
      setSelectedClasse: (classe) => set({ selectedClasse: classe }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),
      generationProgress: 0,
      setGenerationProgress: (v) => set({ generationProgress: v }),

      history: [],
      addHistory: (entry) => set((state) => ({ history: [entry, ...state.history] })),

      reset: () =>
        set({
          students: [],
          columnMapping: null,
          rawHeaders: [],
          validationErrors: [],
          activeStep: 0,
          importMode: null,
          selectedClasse: '',
          searchQuery: '',
        }),
    }),
    {
      name: 'cardify-store',
      partialize: (state) => ({
        school: state.school,
        history: state.history,
      }),
    }
  )
)
