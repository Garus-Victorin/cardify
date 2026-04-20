'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Archive, Image, ArrowRight, User } from 'lucide-react'
import { useStore } from '@/store'
import { extractPhotosFromZip } from '@/lib/photos'
import { fileToDataUrl } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function PhotoManager() {
  const { students, updateStudentPhoto, setActiveStep } = useStore()
  const [loading, setLoading] = useState(false)
  const [matched, setMatched] = useState(0)

  const onZipDrop = useCallback(async (files: File[]) => {
    const zip = files[0]
    if (!zip) return
    setLoading(true)
    try {
      const photoMap = await extractPhotosFromZip(zip)
      let count = 0
      students.forEach((s) => {
        const key = s.matricule.toLowerCase()
        if (photoMap.has(key)) {
          updateStudentPhoto(s.id, photoMap.get(key)!)
          count++
        }
      })
      setMatched(count)
    } finally {
      setLoading(false)
    }
  }, [students, updateStudentPhoto])

  const { getRootProps: getZipProps, getInputProps: getZipInput, isDragActive: isZipDrag } = useDropzone({
    onDrop: onZipDrop,
    accept: { 'application/zip': ['.zip'], 'application/x-zip-compressed': ['.zip'] },
    maxFiles: 1,
  })

  const withPhotos = students.filter((s) => s.photoUrl).length
  const missing = students.length - withPhotos

  return (
    <div className="space-y-6">
      {/* ZIP Upload */}
      <div
        {...getZipProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isZipDrag ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-300 hover:border-[#1e3a5f]'
        )}
      >
        <input {...getZipInput()} />
        <Archive className="mx-auto mb-3 text-[#1e3a5f]" size={40} />
        <p className="font-medium text-gray-700">Importer un ZIP de photos</p>
        <p className="text-sm text-gray-400 mt-1">
          Les fichiers doivent être nommés par matricule (ex: 2024001.jpg)
        </p>
      </div>

      {loading && <p className="text-sm text-center text-[#1e3a5f] animate-pulse">Extraction en cours...</p>}

      {matched > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {matched} photo(s) associée(s) avec succès
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#1e3a5f]">{students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total élèves</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{withPhotos}</p>
          <p className="text-xs text-gray-500 mt-1">Avec photo</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{missing}</p>
          <p className="text-xs text-gray-500 mt-1">Sans photo</p>
        </div>
      </div>

      {/* Per-student manual upload */}
      <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
        {students.map((s) => (
          <StudentPhotoRow key={s.id} student={s} onPhoto={(url) => updateStudentPhoto(s.id, url)} />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setActiveStep(1)}>Retour</Button>
        <Button onClick={() => setActiveStep(3)}>
          Continuer <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function StudentPhotoRow({ student, onPhoto }: { student: { id: string; nom: string; prenoms: string; matricule: string; photoUrl?: string }; onPhoto: (url: string) => void }) {
  const onDrop = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return
    const url = await fileToDataUrl(f)
    onPhoto(url)
  }, [onPhoto])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
  })

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {student.photoUrl ? (
          <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User className="w-full h-full p-2 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{student.nom} {student.prenoms}</p>
        <p className="text-xs text-gray-400">{student.matricule}</p>
      </div>
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        <button className={cn(
          'text-xs px-2 py-1 rounded border transition-colors',
          student.photoUrl ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-gray-300 text-gray-500 hover:bg-gray-100'
        )}>
          <Image size={12} className="inline mr-1" />
          {student.photoUrl ? 'Changer' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}
