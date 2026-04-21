'use client'
import { useStore } from '@/store'
import { FileSpreadsheet, ClipboardList, ArrowLeft, Zap, Users, ImageIcon, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ExcelUploader from './ExcelUploader'
import StudentForm from './StudentForm'

const OPTIONS = [
  {
    mode: 'excel' as const,
    icon: FileSpreadsheet,
    title: 'Importer un fichier Excel',
    description: 'Chargez un fichier .xlsx ou .xls pour importer tous vos élèves en une seule opération.',
    tags: [{ icon: Zap, label: 'Rapide' }, { icon: Users, label: 'Multi-élèves' }, { icon: FileSpreadsheet, label: '.xlsx / .xls' }],
    accent: 'emerald',
    gradient: 'from-emerald-50 to-teal-50/60',
    border: 'hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600',
    tagClass: 'bg-emerald-100 text-emerald-700',
    arrowColor: 'text-emerald-500',
  },
  {
    mode: 'form' as const,
    icon: ClipboardList,
    title: 'Saisie manuelle',
    description: 'Remplissez un formulaire détaillé pour chaque élève, avec photo et tous les champs.',
    tags: [{ icon: ClipboardList, label: 'Manuel' }, { icon: Users, label: 'Un par un' }, { icon: ImageIcon, label: 'Avec photo' }],
    accent: 'blue',
    gradient: 'from-blue-50 to-indigo-50/60',
    border: 'hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-600',
    tagClass: 'bg-blue-100 text-blue-700',
    arrowColor: 'text-blue-500',
  },
]

export default function ImportChoice() {
  const { importMode, setImportMode } = useStore()

  return (
    <AnimatePresence mode="wait">
      {importMode ? (
        <motion.div
          key="sub"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-5"
        >
          <button
            onClick={() => setImportMode(null)}
            className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors duration-200"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <ArrowLeft size={13} />
            </span>
            Changer de mode d'import
          </button>
          {importMode === 'excel' ? <ExcelUploader /> : <StudentForm />}
        </motion.div>
      ) : (
        <motion.div
          key="choice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="space-y-7"
        >
          {/* Heading */}
          <div className="text-center space-y-1.5">
            <p className="text-[15px] font-semibold text-slate-700">Comment souhaitez-vous ajouter vos élèves ?</p>
            <p className="text-sm text-slate-400">Choisissez la méthode qui correspond à votre situation</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OPTIONS.map(({ mode, icon: Icon, title, description, tags, gradient, border, iconBg, tagClass, arrowColor }, i) => (
              <motion.button
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setImportMode(mode)}
                className={`group relative text-left rounded-2xl border-2 border-slate-200 bg-gradient-to-br ${gradient} ${border} p-5 sm:p-6 transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden w-full`}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/60" />

                <div className="flex flex-col gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon size={24} strokeWidth={1.8} />
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-800 text-[15px] leading-snug">{title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(({ icon: TagIcon, label }) => (
                      <span key={label} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${tagClass}`}>
                        <TagIcon size={10} strokeWidth={2.5} />
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div className={`flex items-center gap-1 text-xs font-semibold ${arrowColor} mt-1`}>
                    Choisir cette option
                    <motion.span
                      className="inline-block"
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <ArrowRight size={13} />
                    </motion.span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
