'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { mapRowsToStudents } from '@/lib/excel'
import { ArrowRight, Wand2, CheckCircle2, Circle, AlertCircle, ChevronDown, Check, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Select from '@radix-ui/react-select'

const FIELDS = [
  { key: 'matricule',     label: 'N° Matricule',        required: true  },
  { key: 'nom',           label: 'Nom',                 required: true  },
  { key: 'prenoms',       label: 'Prénoms',             required: false },
  { key: 'neLe',          label: 'Date de naissance',   required: false },
  { key: 'lieuNaissance', label: 'Lieu de naissance',   required: false },
  { key: 'nationalite',   label: 'Nationalité',         required: false },
  { key: 'sexe',          label: 'Sexe',                required: false },
  { key: 'classe',        label: 'Classe',              required: false },
  { key: 'tel',           label: 'N° Téléphone',        required: false },
  { key: 'photo',         label: 'Photo (nom fichier)', required: false },
] as const

export default function ColumnMapper() {
  const { rawHeaders, setColumnMapping, setStudents, setActiveStep, school } = useStore()
  const { user } = useAuth()
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const schoolId = user?.schoolId ?? school.id

  const autoDetect = () => {
    const auto: Record<string, string> = {}
    const patterns: Record<string, RegExp> = {
      matricule:     /matricule|mat[^r]|n[°o]\s*mat/i,
      nom:           /^nom$/i,
      prenoms:       /pr[eé]nom/i,
      neLe:          /n[eé]\s*(le|date)|date.*naiss|naiss.*date/i,
      lieuNaissance: /lieu|naiss/i,
      nationalite:   /national/i,
      sexe:          /sexe|genre/i,
      classe:        /classe|niveau|section/i,
      tel:           /t[eé]l|phone|contact|mobile/i,
      photo:         /photo|image|fichier/i,
    }
    rawHeaders.forEach((h) => {
      Object.entries(patterns).forEach(([field, regex]) => {
        if (!auto[field] && regex.test(h)) auto[field] = h
      })
    })
    setMapping(auto)
  }

  const handleSubmit = () => {
    const missing = FIELDS.filter((f) => f.required && !mapping[f.key]).map((f) => f.label)
    if (missing.length > 0) {
      setError(`Champs requis non mappés : ${missing.join(', ')}`)
      return
    }
    setError('')
    const rawRows = JSON.parse(sessionStorage.getItem('cardify_rows') ?? '[]')
    const students = mapRowsToStudents(rawRows, mapping as never, schoolId)
    setStudents(students)
    setColumnMapping(mapping as never)
    setActiveStep(2)
  }

  const mappedCount = FIELDS.filter((f) => mapping[f.key]).length
  const progress = (mappedCount / FIELDS.length) * 100
  const requiredDone = FIELDS.filter((f) => f.required).every((f) => mapping[f.key])

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[15px] font-semibold text-slate-700">Associez vos colonnes Excel</p>
          <p className="text-sm text-slate-400 leading-relaxed hidden sm:block">
            Faites correspondre chaque colonne de votre fichier à un champ de la carte.{' '}
            <span className="text-[#1e3a5f] font-medium">Matricule</span> et{' '}
            <span className="text-[#1e3a5f] font-medium">Nom</span> sont obligatoires.
          </p>
          <p className="text-xs text-slate-400 sm:hidden">
            <span className="text-[#1e3a5f] font-medium">Matricule</span> et <span className="text-[#1e3a5f] font-medium">Nom</span> sont obligatoires.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={autoDetect}
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-semibold hover:bg-[#1e3a5f]/10 transition-colors duration-200"
        >
          <Sparkles size={13} />
          Détection auto
        </motion.button>
      </div>

      {/* ── Progress bar ── */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Progression du mapping</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#1e3a5f]">{mappedCount}</span>
            <span className="text-xs text-slate-400">/ {FIELDS.length} champs</span>
            {requiredDone && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-1 inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
              >
                <CheckCircle2 size={10} /> Requis OK
              </motion.span>
            )}
          </div>
        </div>
        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1e3a5f] to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </div>

      {/* ── Fields grid ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.045 } } }}
      >
        {FIELDS.map(({ key, label, required }) => {
          const isMapped = !!mapping[key]
          return (
            <motion.div
              key={key}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  {label}
                  {required && <span className="text-red-400 text-[10px]">●</span>}
                </label>
                <AnimatePresence mode="wait">
                  {isMapped ? (
                    <motion.span
                      key="mapped"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"
                    >
                      <CheckCircle2 size={11} /> Mappé
                    </motion.span>
                  ) : (
                    <motion.span
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-slate-300"
                    >
                      {required ? 'Requis' : 'Optionnel'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Radix Select */}
              <Select.Root
                value={mapping[key] ?? ''}
                onValueChange={(val) => setMapping((m) => ({ ...m, [key]: val }))}
              >
                <Select.Trigger
                  className={[
                    'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none',
                    'focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]',
                    isMapped
                      ? 'border-emerald-300 bg-emerald-50/60 text-slate-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <Select.Value placeholder="— Sélectionner une colonne —" />
                  <Select.Icon className="shrink-0">
                    <ChevronDown size={14} className={isMapped ? 'text-emerald-500' : 'text-slate-300'} />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content
                    position="popper"
                    sideOffset={6}
                    className="z-50 w-[var(--radix-select-trigger-width)] bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/80 overflow-hidden"
                  >
                    <Select.Viewport className="p-1.5 max-h-56 overflow-y-auto">
                      <div className="px-3 py-2 text-sm text-slate-300 italic select-none">— Aucune sélection —</div>
                      <div className="my-1 border-t border-slate-100" />
                      {rawHeaders.map((h) => (
                        <Select.Item
                          key={h}
                          value={h}
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer text-slate-700 hover:bg-[#1e3a5f]/6 outline-none data-[highlighted]:bg-[#1e3a5f]/6 data-[state=checked]:text-[#1e3a5f] data-[state=checked]:font-medium"
                        >
                          <Select.ItemIndicator className="shrink-0">
                            <Check size={12} className="text-emerald-500" />
                          </Select.ItemIndicator>
                          <Select.ItemText>{h}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setActiveStep(0)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
        >
          ← Retour
        </button>

        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continuer
          <ArrowRight size={15} strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  )
}
