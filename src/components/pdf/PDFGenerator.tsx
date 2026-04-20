'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { generateQRCode } from '@/lib/qrcode'
import Button from '@/components/ui/Button'
import { FileDown, CheckCircle, Filter, RotateCcw, Eye, X } from 'lucide-react'
import { getUniqueClasses, nanoid } from '@/lib/utils'
import type { Student, School } from '@/types'

interface DownloadButtonProps {
  students: Student[]
  school: School
  qrCodes: Record<string, string>
  fileName: string
  onReset: () => void
}

function DownloadButton({ students, school, qrCodes, fileName, onReset }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const buildBlob = async () => {
    const { pdf } = await import('@react-pdf/renderer')
    const { default: Doc } = await import('./CardifyDocument')
    return pdf(<Doc students={students} school={school} qrCodes={qrCodes} />).toBlob()
  }

  const handleDownload = async () => {
    setLoading(true)
    try {
      const blob = await buildBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('PDF error', e)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    setPreviewing(true)
    try {
      const blob = await buildBlob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (e) {
      console.error('PDF preview error', e)
      setPreviewing(false)
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewing(false)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle size={18} /> PDF pret a telecharger
        </div>
        <div className="flex gap-2">
          <Button size="lg" loading={loading} onClick={handleDownload} className="flex-1">
            <FileDown size={18} /> {loading ? 'Compilation...' : 'Telecharger'}
          </Button>
          <Button size="lg" variant="secondary" loading={previewing && !previewUrl} onClick={handlePreview} className="flex-1">
            <Eye size={18} /> Apercu
          </Button>
        </div>
        <Button variant="secondary" className="w-full" onClick={onReset}>
          <RotateCcw size={16} /> Regenerer
        </Button>
      </div>

      {/* Modal apercu PDF */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70" onClick={closePreview}>
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
            <span className="text-white text-sm font-medium">{fileName}</span>
            <button onClick={closePreview} className="text-white hover:text-gray-300 p-1">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Apercu PDF"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default function PDFGenerator() {
  const { students, school, selectedClasse, setSelectedClasse, addHistory, setActiveStep } = useStore()
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  const classes = getUniqueClasses(students)
  const filtered = selectedClasse ? students.filter((s) => s.classe === selectedClasse) : students
  const freemiumLimit = school.plan === 'free' ? 50 : Infinity
  const exportStudents = filtered.slice(0, freemiumLimit)
  const isLimited = school.plan === 'free' && filtered.length > 50

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress(0)
    const codes: Record<string, string> = {}
    for (let i = 0; i < exportStudents.length; i++) {
      const s = exportStudents[i]
      try {
        codes[s.id] = await generateQRCode(`CARDIFY|${s.matricule}|${s.nom}|${s.prenoms}`)
      } catch {
        codes[s.id] = ''
      }
      setProgress(Math.round(((i + 1) / exportStudents.length) * 100))
    }
    setQrCodes(codes)
    setReady(true)
    setGenerating(false)

    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          schoolId: school.id,
          studentCount: exportStudents.length,
          classeFilter: selectedClasse || null,
        }),
      })
    } catch { /* non-blocking */ }

    addHistory({
      id: nanoid(),
      schoolId: school.id,
      createdAt: new Date().toISOString(),
      studentCount: exportStudents.length,
      filters: selectedClasse ? { classe: selectedClasse } : undefined,
    })
  }

  const handleReset = () => { setReady(false); setProgress(0) }

  const fileName = `cartes-scolaires-${school.anneeScolaire}-${selectedClasse || 'toutes-classes'}.pdf`

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Filter size={18} className="text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-700">Filtrer par classe</p>
          <p className="text-xs text-gray-400">Laissez vide pour exporter toutes les classes</p>
        </div>
        <select
          value={selectedClasse}
          onChange={(e) => { setSelectedClasse(e.target.value); setReady(false) }}
          className="ml-auto border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000080]"
        >
          <option value="">Toutes les classes ({students.length} eleves)</option>
          {classes.map((c) => (
            <option key={c} value={c}>{c} ({students.filter((s) => s.classe === c).length} eleves)</option>
          ))}
        </select>
      </div>

      {isLimited && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          Plan gratuit limite a 50 eleves. {filtered.length - 50} eleve(s) non exporte(s).{' '}
          <a href="#" className="underline font-medium">Passer en Premium</a>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#000080]">{exportStudents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Eleves a exporter</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{Math.ceil(exportStudents.length / 3)}</p>
          <p className="text-xs text-gray-500 mt-1">Pages A4</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">3</p>
          <p className="text-xs text-gray-500 mt-1">Cartes par page</p>
        </div>
      </div>

      {/* Progress */}
      {generating && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Generation des QR codes...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#000080] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!ready ? (
          <Button size="lg" loading={generating} onClick={handleGenerate} className="w-full">
            <FileDown size={18} /> Preparer le PDF ({exportStudents.length} cartes)
          </Button>
        ) : (
          <DownloadButton
            students={exportStudents}
            school={school}
            qrCodes={qrCodes}
            fileName={fileName}
            onReset={handleReset}
          />
        )}
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => setActiveStep(3)}>Retour</Button>
      </div>
    </div>
  )
}
