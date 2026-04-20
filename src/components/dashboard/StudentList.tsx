'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import CardPreview from '@/components/card/CardPreview'
import Button from '@/components/ui/Button'
import { getUniqueClasses, fileToDataUrl } from '@/lib/utils'
import {
  Search, FileDown, Edit2, X, Check, User, Upload,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react'
import type { Student } from '@/types'

const FIELDS: { key: keyof Student; label: string; type?: string }[] = [
  { key: 'matricule',      label: 'N° Matricule' },
  { key: 'nom',            label: 'Nom' },
  { key: 'prenoms',        label: 'Prenoms' },
  { key: 'neLe',           label: 'Ne(e) le',          type: 'date' },
  { key: 'lieuNaissance',  label: 'Lieu de naissance' },
  { key: 'nationalite',    label: 'Nationalite' },
  { key: 'sexe',           label: 'Sexe' },
  { key: 'classe',         label: 'Classe' },
  { key: 'tel',            label: 'Telephone' },
]

export default function StudentList() {
  const { students, setStudents, school, setActiveStep, selectedClasse, setSelectedClasse, searchQuery, setSearchQuery } = useStore()
  const [index, setIndex] = useState(0)
  const [editField, setEditField] = useState<keyof Student | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editPhotoMode, setEditPhotoMode] = useState(false)

  const classes = getUniqueClasses(students)

  const filtered = students.filter((s) => {
    const matchClasse = !selectedClasse || s.classe === selectedClasse
    const q = searchQuery.toLowerCase()
    return matchClasse && (!q || s.nom.toLowerCase().includes(q) || s.prenoms.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q))
  })

  const current = filtered[Math.min(index, filtered.length - 1)]

  const goTo = (i: number) => {
    setIndex(Math.max(0, Math.min(i, filtered.length - 1)))
    setEditField(null)
    setEditPhotoMode(false)
  }

  const startEdit = (field: keyof Student) => {
    setEditField(field)
    setEditValue(String(current[field] ?? ''))
  }

  const saveField = () => {
    if (!editField || !current) return
    setStudents(students.map((s) =>
      s.id === current.id ? { ...s, [editField]: editValue } : s
    ))
    setEditField(null)
  }

  const handlePhoto = async (file: File) => {
    const url = await fileToDataUrl(file)
    setStudents(students.map((s) => s.id === current.id ? { ...s, photoUrl: url } : s))
    setEditPhotoMode(false)
  }

  if (filtered.length === 0) {
    return (
      <div className="space-y-4">
        <Filters searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedClasse={selectedClasse} setSelectedClasse={setSelectedClasse} classes={classes} count={0} />
        <div className="text-center py-16 text-gray-400 text-sm">Aucun eleve trouve</div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setActiveStep(2)}>Retour</Button>
        </div>
      </div>
    )
  }

  const safeIndex = Math.min(index, filtered.length - 1)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Filters searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedClasse={selectedClasse} setSelectedClasse={setSelectedClasse} classes={classes} count={filtered.length} />

      {/* Main layout: card left, infos right */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* LEFT — carte grande + navigation */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          {/* Navigation haut */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo(safeIndex - 1)}
              disabled={safeIndex === 0}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[80px] text-center">
              {safeIndex + 1} / {filtered.length}
            </span>
            <button
              onClick={() => goTo(safeIndex + 1)}
              disabled={safeIndex === filtered.length - 1}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Carte agrandie */}
          {current && (
            <div className="transition-all duration-200">
              <CardPreview student={current} school={school} scale={1.15} />
            </div>
          )}

          {/* Miniatures navigation */}
          <div className="flex gap-2 flex-wrap justify-center max-w-[400px]">
            {filtered.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
                  i === safeIndex ? 'border-[#1e3a5f] scale-110' : 'border-gray-200 hover:border-gray-400'
                }`}
                title={`${s.nom} ${s.prenoms}`}
              >
                {s.photoUrl
                  ? <img src={s.photoUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                      {s.nom.charAt(0)}
                    </div>
                }
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — infos avec boutons modifier */}
        {current && (
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-base">
                {current.nom} {current.prenoms}
              </h3>
              <span className="text-xs bg-blue-100 text-[#1e3a5f] px-2.5 py-1 rounded-full font-medium">
                {current.classe}
              </span>
            </div>

            {/* Champs */}
            <div className="space-y-1">
              {FIELDS.map(({ key, label, type }) => (
                <div key={key} className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group border border-transparent hover:border-gray-200 transition-all">
                  {editField === key ? (
                    <>
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
                      {key === 'sexe' ? (
                        <div className="flex gap-2 flex-1">
                          {(['M', 'F'] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setEditValue(v)}
                              className={`flex-1 py-1 rounded border text-xs font-medium transition-colors ${
                                editValue === v ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'border-gray-300 text-gray-600'
                              }`}
                            >
                              {v === 'M' ? 'Masculin' : 'Feminin'}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={type ?? 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') setEditField(null) }}
                          className="flex-1 border border-[#1e3a5f] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                        />
                      )}
                      <button onClick={saveField} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditField(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
                      <span className={`flex-1 text-sm font-medium truncate ${
                        key === 'matricule' ? 'text-[#1e3a5f]' : 'text-gray-800'
                      }`}>
                        {key === 'sexe'
                          ? (current.sexe === 'M' ? 'Masculin' : 'Feminin')
                          : (String(current[key] ?? '') || <span className="text-gray-300 italic text-xs">Non renseigne</span>)
                        }
                      </span>
                      <button
                        onClick={() => startEdit(key)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                        title={`Modifier ${label}`}
                      >
                        <Edit2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Photo row */}
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group border border-transparent hover:border-gray-200 transition-all">
                <span className="text-xs text-gray-500 w-36 flex-shrink-0">Photo</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                    {current.photoUrl
                      ? <img src={current.photoUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-gray-400" /></div>
                    }
                  </div>
                  <span className="text-sm text-gray-500 italic text-xs">
                    {current.photoUrl ? 'Photo importee' : 'Aucune photo'}
                  </span>
                </div>
                {editPhotoMode ? (
                  <label className="cursor-pointer opacity-100 flex items-center gap-1.5 text-xs text-[#1e3a5f] border border-[#1e3a5f] px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0">
                    <Upload size={12} /> Choisir
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f) }} />
                  </label>
                ) : (
                  <button
                    onClick={() => setEditPhotoMode(true)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded-lg transition-all flex-shrink-0"
                    title="Modifier la photo"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation bas */}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <Button variant="ghost" onClick={() => setActiveStep(2)}>Retour</Button>
        <Button onClick={() => setActiveStep(4)}>
          <FileDown size={16} /> Generer le PDF
        </Button>
      </div>
    </div>
  )
}

function Filters({ searchQuery, setSearchQuery, selectedClasse, setSelectedClasse, classes, count }: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedClasse: string
  setSelectedClasse: (v: string) => void
  classes: string[]
  count: number
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un eleve..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
        />
      </div>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
        <Filter size={13} className="text-gray-400" />
        <select
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
          className="text-sm focus:outline-none bg-transparent"
        >
          <option value="">Toutes les classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">{count} eleve(s)</span>
    </div>
  )
}
