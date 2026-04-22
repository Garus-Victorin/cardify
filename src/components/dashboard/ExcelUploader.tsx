'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseExcelHeaders } from '@/lib/excel'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

export default function ExcelUploader() {
  const { setRawHeaders, setActiveStep } = useStore()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setError('')
    setLoading(true)
    try {
      const { headers, rows: r } = await parseExcelHeaders(f)
      setFile(f)
      setRows(r)
      setRawHeaders(headers)
      sessionStorage.setItem('cardify_rows', JSON.stringify(r))
    } catch {
      setError('Fichier invalide. Veuillez importer un fichier Excel (.xlsx, .xls).')
    } finally {
      setLoading(false)
    }
  }, [setRawHeaders])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const reset = () => { setFile(null); setRows([]); setError('') }

  return (
    <div className="space-y-5">

      {/* ── Drop zone ── */}
      <div
        {...getRootProps()}
        className={cn(
          'relative group rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden select-none',
          isDragActive
            ? 'border-emerald-400 bg-emerald-50 shadow-inner shadow-emerald-100'
            : file
            ? 'border-emerald-300 bg-emerald-50/40'
            : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md'
        )}
      >
        <motion.div whileTap={{ scale: 0.995 }}>
        <input {...getInputProps()} />

        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="relative flex flex-col items-center justify-center gap-4 py-8 sm:py-12 px-4 sm:px-6 text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.18, rotate: -6, y: -4 } : { scale: 1, rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-300',
              isDragActive ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
            )}
          >
            <FileSpreadsheet size={32} strokeWidth={1.6} />
          </motion.div>

          <div className="space-y-1">
            <p className="text-[15px] font-semibold text-slate-700">
              {isDragActive ? 'Relâchez pour importer…' : 'Glissez votre fichier Excel ici'}
            </p>
            <p className="text-sm text-slate-400">
              ou{' '}
              <span className="text-emerald-600 font-medium underline underline-offset-2 decoration-dashed">
                cliquez pour parcourir
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {['.xlsx', '.xls'].map((ext) => (
              <span key={ext} className="text-xs font-mono bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md shadow-sm">
                {ext}
              </span>
            ))}
          </div>
        </div>
        </motion.div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── File preview ── */}
      <AnimatePresence>
        {file && rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-4"
          >
            {/* File info card */}
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText size={20} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  <span className="text-emerald-600 font-medium">{rows.length} lignes</span> détectées ·{' '}
                  {Object.keys(rows[0]).length} colonnes
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} />
                Valide
              </div>
              <button
                onClick={reset}
                className="text-slate-300 hover:text-slate-500 transition-colors ml-1"
                title="Supprimer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Preview table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aperçu des données</span>
                <span className="text-xs text-slate-400">{rows.length} lignes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80">
                      {Object.keys(rows[0]).map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap border-b border-slate-100">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2.5 text-slate-600 max-w-[140px] truncate">
                            {String(val)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* CTA */}
            <div className="flex justify-end pt-1">
              <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                onClick={() => setActiveStep(1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload size={15} strokeWidth={2.2} />
                )}
                Continuer vers le mapping
                <ChevronRight size={15} className="opacity-70" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
