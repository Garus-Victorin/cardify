'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useStore } from '@/store'
import { fileToDataUrl } from '@/lib/utils'
import { extractPhotosFromZip } from '@/lib/photos'
import {
  FolderOpen, Images, CheckCircle2, AlertCircle, X,
  Eye, EyeOff, Upload, ZoomIn, ChevronDown, ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Student } from '@/types'

// ── Matching intelligent ──────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Levenshtein distance ratio [0-1]
function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  const m = na.length, n = nb.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = na[i-1] === nb[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return 1 - dp[m][n] / Math.max(m, n)
}

// Tokenize: split on separators and return all tokens + bigrams
function tokens(s: string): string[] {
  const parts = normalize(s).split(/[_\-\s.]+/).filter(Boolean)
  const bigrams = parts.length > 1
    ? parts.slice(0, -1).map((p, i) => p + parts[i + 1])
    : []
  return [...parts, ...bigrams, normalize(s)]
}

interface MatchResult {
  student: Student
  score: number
  method: string
}

function matchPhotoToStudent(photoName: string, students: Student[]): MatchResult | null {
  const pn = normalize(photoName)
  const ptokens = tokens(photoName)

  const results: MatchResult[] = []

  const push = (student: Student, score: number, method: string) => {
    results.push({ student, score, method })
  }

  for (const s of students) {
    const mat   = normalize(s.matricule)
    const nom   = normalize(s.nom)
    const pre   = normalize(s.prenoms)
    const full1 = nom + pre
    const full2 = pre + nom
    const parts = [mat, nom, pre, full1, full2]

    // ── Niveau 1 : exact ──
    for (const part of parts) {
      if (part && pn === part) {
        const label = part === mat ? 'matricule' : part === nom ? 'nom' : part === pre ? 'prénom' : 'nom complet'
        return { student: s, score: 1.0, method: `exact (${label})` }
      }
    }

    // ── Niveau 2 : contenu ──
    if (mat.length >= 3 && pn.includes(mat)) push(s, 0.95, 'matricule contenu dans fichier')
    if (nom.length >= 3 && pn.includes(nom)) push(s, 0.90, 'nom contenu dans fichier')
    if (pre.length >= 3 && pn.includes(pre)) push(s, 0.88, 'prénom contenu dans fichier')

    // ── Niveau 3 : tokens ──
    const hasNom = ptokens.some((t) => t === nom || similarity(t, nom) > 0.85)
    const hasPre = ptokens.some((t) => t === pre || similarity(t, pre) > 0.85)
    const hasMat = ptokens.some((t) => t === mat || similarity(t, mat) > 0.88)

    if (hasNom && hasPre) push(s, 0.97, 'nom + prénom dans tokens')
    if (hasMat && hasNom) push(s, 0.96, 'matricule + nom dans tokens')
    if (hasMat && hasPre) push(s, 0.94, 'matricule + prénom dans tokens')
    if (hasMat)           push(s, 0.92, 'matricule dans tokens')

    // ── Niveau 4 : fuzzy global ──
    const fuzzy: Array<{ val: string; label: string; threshold: number }> = [
      { val: mat,   label: 'matricule fuzzy',  threshold: 0.82 },
      { val: nom,   label: 'nom fuzzy',        threshold: 0.78 },
      { val: pre,   label: 'prénom fuzzy',     threshold: 0.78 },
      { val: full1, label: 'nom+prénom fuzzy', threshold: 0.80 },
      { val: full2, label: 'prénom+nom fuzzy', threshold: 0.80 },
    ]
    for (const { val, label, threshold } of fuzzy) {
      if (!val) continue
      const sc = similarity(pn, val)
      if (sc >= threshold) push(s, sc * 0.95, label)
    }

    // ── Niveau 5 : meilleur token ──
    for (const tok of ptokens) {
      if (tok.length < 3) continue
      const tokenScores: Array<{ sc: number; label: string }> = [
        { sc: similarity(tok, mat), label: 'token~matricule' },
        { sc: similarity(tok, nom), label: 'token~nom' },
        { sc: similarity(tok, pre), label: 'token~prénom' },
      ]
      for (const { sc, label } of tokenScores) {
        if (sc >= 0.85) push(s, sc * 0.88, label)
      }
    }
  }

  // Meilleur résultat au-dessus du seuil
  const best = results.reduce<MatchResult | null>((acc, cur) =>
    acc === null || cur.score > acc.score ? cur : acc
  , null)

  return best !== null && best.score >= 0.72 ? best : null
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhotoEntry {
  fileName: string
  dataUrl: string
  matched: Student | null
  score: number
  method: string
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function PhotoImporter() {
  const { students, setStudents } = useStore()
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [zoomPhoto, setZoomPhoto] = useState<PhotoEntry | null>(null)
  const [showUnmatched, setShowUnmatched] = useState(false)
  const [applied, setApplied] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  const processFiles = useCallback(async (files: File[]) => {
    setLoading(true)
    setApplied(false)
    const entries: PhotoEntry[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

      if (['zip'].includes(ext)) {
        const map = await extractPhotosFromZip(file)
        for (const [name, dataUrl] of map.entries()) {
          const match = matchPhotoToStudent(name, students)
          entries.push({
            fileName: name,
            dataUrl,
            matched: match?.student ?? null,
            score: match?.score ?? 0,
            method: match?.method ?? '',
          })
        }
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        const dataUrl = await fileToDataUrl(file)
        const name = file.name.replace(/\.[^.]+$/, '')
        const match = matchPhotoToStudent(name, students)
        entries.push({
          fileName: name,
          dataUrl,
          matched: match?.student ?? null,
          score: match?.score ?? 0,
          method: match?.method ?? '',
        })
      }
    }

    setPhotos(entries)
    setShowPreview(true)
    setLoading(false)

    // Avertissements
    const extra = entries.length - students.length
    if (extra > 0) {
      setWarning(`${entries.length} photos importées pour ${students.length} élève(s). ${extra} photo(s) en trop — seules les photos associées seront utilisées.`)
    } else if (entries.length < students.length) {
      setWarning(`${entries.length} photos pour ${students.length} élève(s) — ${students.length - entries.length} élève(s) sans photo.`)
    } else {
      setWarning(null)
    }
  }, [students])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/zip': ['.zip'],
    },
    noClick: false,
  })

  const matched   = photos.filter((p) => p.matched)
  const unmatched = photos.filter((p) => !p.matched)

  const applyPhotos = () => {
    const updated = students.map((s) => {
      const photo = matched.find((p) => p.matched?.id === s.id)
      return photo ? { ...s, photoUrl: photo.dataUrl } : s
    })
    setStudents(updated)
    setApplied(true)
  }

  const removePhoto = (fileName: string) => {
    setPhotos((p) => p.filter((x) => x.fileName !== fileName))
  }

  const reassign = (fileName: string, studentId: string) => {
    const student = students.find((s) => s.id === studentId) ?? null
    setPhotos((p) => p.map((x) =>
      x.fileName === fileName
        ? { ...x, matched: student, score: 1, method: 'manuel' }
        : x
    ))
    setApplied(false)
  }

  if (photos.length === 0) {
    return (
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 p-8 text-center ${
          isDragActive
            ? 'border-violet-400 bg-violet-50'
            : 'border-slate-200 bg-slate-50/60 hover:border-violet-300 hover:bg-violet-50/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-violet-200 text-violet-700' : 'bg-violet-100 text-violet-500'}`}>
            <FolderOpen size={28} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragActive ? 'Relâchez pour importer…' : 'Glissez un dossier ZIP ou des photos'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Les photos seront associées automatiquement par nom ou matricule
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {['.zip', '.jpg', '.png', '.webp'].map((e) => (
              <span key={e} className="text-xs font-mono bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md">{e}</span>
            ))}
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-violet-600 mt-2">
              <div className="loader" style={{ '--R': '12px' } as React.CSSProperties} />
              Analyse en cours…
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Stats bar ── */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Images size={15} className="text-slate-400" />
            <span className="font-semibold text-slate-700">{photos.length}</span>
            <span className="text-slate-400">photo(s)</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 size={14} />
            <span className="font-semibold">{matched.length}</span>
            <span className="text-emerald-500">associée(s)</span>
          </div>
          {unmatched.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-orange-500">
              <AlertCircle size={14} />
              <span className="font-semibold">{unmatched.length}</span>
              <span>non trouvée(s)</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
          <button
            onClick={() => { setPhotos([]); setApplied(false) }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X size={13} /> Réinitialiser
          </button>
          <button
            onClick={applyPhotos}
            disabled={matched.length === 0}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${
              applied
                ? 'bg-emerald-500 text-white'
                : 'bg-[#1e3a5f] hover:bg-[#16304f] text-white disabled:opacity-40'
            }`}
          >
            <CheckCircle2 size={13} />
            {applied ? 'Appliqué !' : `Appliquer (${matched.length})`}
          </button>
        </div>
      </div>

      {/* ── Warning ── */}
      {warning && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{warning}</span>
          <button onClick={() => setWarning(null)} className="ml-auto shrink-0 text-orange-400 hover:text-orange-600">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Progress bar ── */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${photos.length ? (matched.length / photos.length) * 100 : 0}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* ── Preview grid ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Matched */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {matched.map((p, i) => (
                <PhotoCard
                  key={`matched-${i}-${p.fileName}`}
                  entry={p}
                  students={students}
                  onZoom={() => setZoomPhoto(p)}
                  onRemove={() => removePhoto(p.fileName)}
                  onReassign={(sid) => reassign(p.fileName, sid)}
                />
              ))}
            </div>

            {/* Unmatched */}
            {unmatched.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowUnmatched((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold text-orange-500 mb-3"
                >
                  {showUnmatched ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {unmatched.length} photo(s) non associée(s)
                </button>
                <AnimatePresence>
                  {showUnmatched && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-hidden"
                    >
                      {unmatched.map((p, i) => (
                        <PhotoCard
                          key={`unmatched-${i}-${p.fileName}`}
                          entry={p}
                          students={students}
                          onZoom={() => setZoomPhoto(p)}
                          onRemove={() => removePhoto(p.fileName)}
                          onReassign={(sid) => reassign(p.fileName, sid)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zoom modal ── */}
      <AnimatePresence>
        {zoomPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setZoomPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={zoomPhoto.dataUrl} alt={zoomPhoto.fileName} className="w-full object-cover max-h-72" />
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-700">{zoomPhoto.fileName}</p>
                {zoomPhoto.matched ? (
                  <p className="text-xs text-emerald-600 mt-1">
                    → {zoomPhoto.matched.nom} {zoomPhoto.matched.prenoms}
                    <span className="ml-2 text-slate-400">({zoomPhoto.method})</span>
                  </p>
                ) : (
                  <p className="text-xs text-orange-500 mt-1">Non associée</p>
                )}
              </div>
              <button onClick={() => setZoomPhoto(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── PhotoCard ─────────────────────────────────────────────────────────────────

function PhotoCard({ entry, students, onZoom, onRemove, onReassign }: {
  entry: PhotoEntry
  students: Student[]
  onZoom: () => void
  onRemove: () => void
  onReassign: (studentId: string) => void
}) {
  const [showSelect, setShowSelect] = useState(false)
  const isMatched = !!entry.matched

  return (
    <div className={`relative rounded-xl border overflow-hidden group transition-all ${
      isMatched ? 'border-emerald-200 bg-emerald-50/30' : 'border-orange-200 bg-orange-50/30'
    }`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img src={entry.dataUrl} alt={entry.fileName} className="w-full h-full object-cover" />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={onZoom} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-colors">
            <ZoomIn size={14} />
          </button>
          <button onClick={onRemove} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white transition-colors">
            <X size={14} />
          </button>
        </div>
        {/* Badge score */}
        {isMatched && (
          <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {Math.round(entry.score * 100)}%
          </div>
        )}
        {!isMatched && (
          <div className="absolute top-1.5 right-1.5 bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            ?
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 space-y-1">
        <p className="text-[11px] font-semibold text-slate-600 truncate">{entry.fileName}</p>
        {isMatched ? (
          <p className="text-[10px] text-emerald-600 truncate">
            {entry.matched!.nom} {entry.matched!.prenoms}
          </p>
        ) : (
          <p className="text-[10px] text-orange-500">Non associée</p>
        )}

        {/* Reassign */}
        <button
          onClick={() => setShowSelect((v) => !v)}
          className="text-[10px] text-slate-400 hover:text-[#1e3a5f] underline"
        >
          {isMatched ? 'Changer' : 'Associer manuellement'}
        </button>
        <AnimatePresence>
          {showSelect && (
            <motion.select
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-[#1e3a5f] bg-white"
              defaultValue=""
              onChange={(e) => { onReassign(e.target.value); setShowSelect(false) }}
            >
              <option value="" disabled>— Choisir un élève —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom} {s.prenoms} ({s.matricule})
                </option>
              ))}
            </motion.select>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
