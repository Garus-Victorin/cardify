'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
import { RotateCcw, Settings, GraduationCap, LogOut, User, Menu, X, History, ChevronDown, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const PDFGenerator = dynamic(
  () => import('@/components/pdf/PDFGenerator'),
  { ssr: false, loading: () => <div className="p-8 text-center text-gray-400 text-sm">Chargement…</div> }
)

type Tab = 'pipeline' | 'settings' | 'history'

const STEP_TITLES = [
  'Importer ou Saisir les données',
  'Mapping des colonnes',
  'Validation',
  'Prévisualisation',
  'Export PDF',
]

const TABS = [
  { key: 'pipeline' as Tab, label: 'Pipeline',   icon: GraduationCap },
  { key: 'settings' as Tab, label: 'Paramètres', icon: Settings },
  { key: 'history'  as Tab, label: 'Historique', icon: Clock },
]

const STEP_SLUGS = ['import', 'mapping', 'validation', 'preview', 'export']

// ── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(name: string): [string, string] {
  const colors: [string, string][] = [
    ['#7C3AED', '#EDE9FE'], ['#0369A1', '#E0F2FE'], ['#065F46', '#D1FAE5'],
    ['#9D174D', '#FCE7F3'], ['#92400E', '#FEF3C7'], ['#1D4ED8', '#DBEAFE'],
    ['#B45309', '#FEF9C3'], ['#0F766E', '#CCFBF1'],
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length]
}

function UserAvatar({ user, onClick, open }: {
  user: { name?: string; email?: string } | null
  onClick: () => void
  open: boolean
}) {
  const label = user?.name ?? user?.email ?? '?'
  const initial = label.charAt(0).toUpperCase()
  const [fg, bg] = avatarColor(label)
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border transition-all ${
        open
          ? 'border-slate-300 bg-slate-100 shadow-sm'
          : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: bg, color: fg }}
      >
        {initial}
      </span>
      <ChevronDown
        size={13}
        className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

function DropItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span className={danger ? 'text-red-500' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { activeStep, school, students, reset, importMode, setActiveStep } = useStore()
  const { user, logout, loading: authLoading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  useSync()

  const getInitialTab = (): Tab => {
    const slug = pathname.split('/dashboard/')[1] ?? ''
    if (slug === 'settings') return 'settings'
    if (slug === 'history')  return 'history'
    return 'pipeline'
  }

  const [tab, setTab]           = useState<Tab>(getInitialTab)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [ready, setReady]         = useState(false)
  const dropRef                   = useRef<HTMLDivElement>(null)

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync URL → state on mount
  useEffect(() => {
    const slug = pathname.split('/dashboard/')[1] ?? ''
    if (slug === 'settings')     setTab('settings')
    else if (slug === 'history') setTab('history')
    else {
      const stepIdx = STEP_SLUGS.indexOf(slug)
      if (stepIdx !== -1) { setTab('pipeline'); setActiveStep(stepIdx) }
    }
    setReady(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync state → URL (only after mount read)
  useEffect(() => {
    if (!ready) return
    let slug: string
    if (tab === 'settings')     slug = 'settings'
    else if (tab === 'history') slug = 'history'
    else slug = STEP_SLUGS[activeStep] ?? 'import'
    const target = `/dashboard/${slug}`
    if (pathname !== target) router.replace(target)
  }, [ready, tab, activeStep, pathname, router])

  const displayStep = importMode === 'form' && activeStep >= 1 ? activeStep - 1 : activeStep
  const stepTitle   = importMode === 'form'
    ? ['Import / Saisie', 'Validation', 'Prévisualisation', 'Export PDF'][displayStep]
    : STEP_TITLES[activeStep]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="loader" />
        <p className="text-sm text-slate-400">Chargement...</p>
      </div>
    )
  }

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
            <div className="hidden sm:block">
              <Badge variant={school.plan === 'premium' ? 'success' : 'warning'}>
                {school.plan === 'premium' ? 'Premium' : 'Gratuit'}
              </Badge>
            </div>

            {students.length > 0 && (
              <button
                onClick={reset}
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50"
              >
                <RotateCcw size={13} /> Nouveau
              </button>
            )}

            {/* Avatar + dropdown */}
            <div className="relative pl-2 border-l border-slate-200" ref={dropRef}>
              <UserAvatar user={user} onClick={() => setDropOpen((v) => !v)} open={dropOpen} />
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    {/* Header avec gradient */}
                    <div
                      className="px-4 py-4 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor(user?.name ?? user?.email ?? '?')[1]}, ${avatarColor(user?.name ?? user?.email ?? '?')[0]}15)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
                          style={{
                            background: avatarColor(user?.name ?? user?.email ?? '?')[1],
                            color: avatarColor(user?.name ?? user?.email ?? '?')[0],
                          }}
                        >
                          {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name ?? 'Utilisateur'}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    {/* Items */}
                    <div className="py-1.5">
                      <DropItem icon={<User size={14} />}     label="Profil"      onClick={() => { setDropOpen(false); setProfileOpen(true) }} />
                      <DropItem icon={<Settings size={14} />} label="Paramètres"  onClick={() => { setTab('settings'); setDropOpen(false) }} />
                      <DropItem icon={<History size={14} />}  label="Historique"  onClick={() => { setTab('history');  setDropOpen(false) }} />
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <DropItem icon={<LogOut size={14} />} label="Se déconnecter" danger onClick={() => { setDropOpen(false); logout() }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

        {/* Mobile drawer */}
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

        {/* Navbar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex border-t border-slate-100">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setMenuOpen(false) }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === key
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
              <SchoolSettings onEditProfile={() => setProfileOpen(true)} />
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
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm px-4 py-4 sm:px-6 sm:py-5">
                <StepIndicator current={activeStep} />
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {activeStep + 1}
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                    {stepTitle}
                  </h2>
                </div>

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

      {/* ── Modal Profil ── */}
      <AnimatePresence>
        {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function ProfileModal({ user, onClose }: {
  user: { name?: string; email?: string; role?: string } | null
  onClose: () => void
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  const save = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      toast.success('Profil mis à jour')
      setTimeout(() => { setSaved(false); onClose(); window.location.reload() }, 1200)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const [fg, bg] = avatarColor(user?.name ?? user?.email ?? '?')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold text-sm">
            <User size={15} /> Mon Profil
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <span
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{ background: bg, color: fg }}
            >
              {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </span>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role ?? 'Utilisateur'}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={save}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved ? 'bg-emerald-500 text-white' : 'bg-[#1e3a5f] hover:bg-[#16304f] text-white'
            }`}
          >
            {saved ? 'Sauvegardé !' : 'Sauvegarder'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
