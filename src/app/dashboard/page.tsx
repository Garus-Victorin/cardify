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
import { RotateCcw, Settings, Clock, GraduationCap, LogOut, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PDFGenerator = dynamic(
  () => import('@/components/pdf/PDFGenerator'),
  { ssr: false, loading: () => <div className="p-8 text-center text-gray-400 text-sm">Chargement…</div> }
)

type Tab = 'pipeline' | 'settings' | 'history'

const STEP_TITLES = [
  'Import / Saisie',
  'Mapping des colonnes',
  'Validation',
  'Prévisualisation',
  'Export PDF',
]

const TABS = [
  { key: 'pipeline' as Tab, label: 'Pipeline',    icon: GraduationCap },
  { key: 'settings' as Tab, label: 'Paramètres',  icon: Settings },
  { key: 'history'  as Tab, label: 'Historique',  icon: Clock },
]

export default function DashboardPage() {
  const { activeStep, school, students, reset, importMode } = useStore()
  const { user, logout } = useAuth()
  useSync()

  const [tab, setTab]           = useState<Tab>('pipeline')
  const [menuOpen, setMenuOpen] = useState(false)

  const displayStep = importMode === 'form' && activeStep >= 1 ? activeStep - 1 : activeStep
  const stepTitle   = importMode === 'form'
    ? ['Import / Saisie', 'Validation', 'Prévisualisation', 'Export PDF'][displayStep]
    : STEP_TITLES[activeStep]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#000080] flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div className="hidden xs:block">
              <p className="text-sm font-bold text-[#000080] leading-none">Cardify</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 max-w-[140px] truncate">{school.name}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Badge plan — masqué sur très petit écran */}
            <div className="hidden sm:block">
              <Badge variant={school.plan === 'premium' ? 'success' : 'warning'}>
                {school.plan === 'premium' ? 'Premium' : 'Gratuit'}
              </Badge>
            </div>

            {/* Reset — masqué sur mobile si pas d'élèves */}
            {students.length > 0 && (
              <button
                onClick={reset}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={13} /> Nouveau
              </button>
            )}

            {/* User */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600">
                <User size={13} className="text-slate-400" />
                <span className="max-w-[100px] truncate">{user?.name ?? user?.email ?? 'Utilisateur'}</span>
              </div>
              <button
                onClick={logout}
                title="Se déconnecter"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>

            {/* Hamburger mobile */}
            <button
              className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="sm:hidden overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                  <User size={13} /> {user?.name ?? user?.email}
                </div>
                <Badge variant={school.plan === 'premium' ? 'success' : 'warning'}>
                  {school.plan === 'premium' ? 'Premium' : 'Gratuit — 50 élèves max'}
                </Badge>
                {students.length > 0 && (
                  <button
                    onClick={() => { reset(); setMenuOpen(false) }}
                    className="flex items-center gap-2 text-sm text-red-500 py-2"
                  >
                    <RotateCcw size={14} /> Nouveau projet
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setMenuOpen(false) }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                tab === key
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <AnimatePresence mode="wait">
          {tab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <SchoolSettings />
            </motion.div>
          )}
          {tab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GenerationHistory />
            </motion.div>
          )}
          {tab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Step indicator card */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm px-4 py-4 sm:px-6 sm:py-5">
                <StepIndicator current={activeStep} />
              </div>

              {/* Step content card */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
                {/* Card header */}
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {activeStep + 1}
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                    {stepTitle}
                  </h2>
                </div>

                {/* Card body */}
                <div className="px-4 sm:px-6 py-5 sm:py-6">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ImportChoice /></motion.div>}
                    {activeStep === 1 && <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ColumnMapper /></motion.div>}
                    {activeStep === 2 && <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ValidationPanel /></motion.div>}
                    {activeStep === 3 && <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StudentList /></motion.div>}
                    {activeStep === 4 && <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PDFGenerator /></motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
