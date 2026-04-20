'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useStore } from '@/store'
import StepIndicator from '@/components/ui/StepIndicator'
import ImportChoice from '@/components/dashboard/ImportChoice'
import ColumnMapper from '@/components/dashboard/ColumnMapper'
import ValidationPanel from '@/components/dashboard/ValidationPanel'
import StudentList from '@/components/dashboard/StudentList'
import SchoolSettings from '@/components/dashboard/SchoolSettings'
import GenerationHistory from '@/components/dashboard/GenerationHistory'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useSync } from '@/hooks/useSync'
import { RotateCcw, Settings, Clock, GraduationCap, LogOut, User } from 'lucide-react'

const PDFGenerator = dynamic(
  () => import('@/components/pdf/PDFGenerator'),
  { ssr: false, loading: () => <div className="p-8 text-center text-gray-400">Chargement...</div> }
)

type Tab = 'pipeline' | 'settings' | 'history'

const STEP_TITLES = [
  'Import / Saisie des eleves',
  'Mapping des colonnes',
  'Validation des donnees',
  'Previsualisation',
  'Export PDF',
]

export default function DashboardPage() {
  const { activeStep, school, students, reset, importMode } = useStore()
  const { user, logout } = useAuth()
  useSync() // auto-load & auto-save to DB
  const [tab, setTab] = useState<Tab>('pipeline')

  // In form mode, step 1 (mapping) is skipped
  const displayStep = importMode === 'form' && activeStep >= 1 ? activeStep - 1 : activeStep
  const stepTitle = importMode === 'form'
    ? ['Import / Saisie des eleves', 'Validation des donnees', 'Previsualisation', 'Export PDF'][displayStep]
    : STEP_TITLES[activeStep]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#000080] flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#000080]">Cardify</h1>
              <p className="text-xs text-gray-400">{school.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={school.plan === 'premium' ? 'success' : 'warning'}>
              {school.plan === 'premium' ? 'Premium' : 'Gratuit - 50 eleves max'}
            </Badge>
            {students.length > 0 && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={14} /> Nouveau projet
              </button>
            )}
            {/* User menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User size={15} className="text-gray-400" />
                <span className="hidden sm:inline">{user?.name ?? user?.email ?? 'Utilisateur'}</span>
              </div>
              <button
                onClick={logout}
                title="Se deconnecter"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 flex gap-1 border-t border-gray-100">
          {([
            { key: 'pipeline', label: 'Pipeline', icon: GraduationCap },
            { key: 'settings', label: 'Parametres', icon: Settings },
            { key: 'history', label: 'Historique', icon: Clock },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'settings' && <SchoolSettings />}
        {tab === 'history' && <GenerationHistory />}
        {tab === 'pipeline' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <StepIndicator current={activeStep} />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                Etape {activeStep + 1} &mdash; {stepTitle}
              </h2>
              {activeStep === 0 && <ImportChoice />}
              {activeStep === 1 && <ColumnMapper />}
              {activeStep === 2 && <ValidationPanel />}
              {activeStep === 3 && <StudentList />}
              {activeStep === 4 && <PDFGenerator />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
