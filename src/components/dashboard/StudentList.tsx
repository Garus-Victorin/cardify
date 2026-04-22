'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import CardPreview from '@/components/card/CardPreview'
import Button from '@/components/ui/Button'
import { getUniqueClasses, fileToDataUrl } from '@/lib/utils'
import {
  Search, FileDown, Edit2, X, Check, User, Upload,
  ChevronLeft, ChevronRight, Filter, AlertCircle,
  LayoutGrid, Eye, Images,
} from 'lucide-react'
import type { Student, School } from '@/types'
import PhotoImporter from './PhotoImporter'

const FIELDS: { key: keyof Student; label: string; type?: string }[] = [
  { key: 'matricule',     label: 'N Matricule' },
  { key: 'nom',           label: 'Nom' },
  { key: 'prenoms',       label: 'Prenoms' },
  { key: 'neLe',          label: 'Date de naissance', type: 'date' },
  { key: 'lieuNaissance', label: 'Lieu de naissance' },
  { key: 'nationalite',   label: 'Nationalite' },
  { key: 'sexe',          label: 'Sexe' },
  { key: 'classe',        label: 'Classe' },
  { key: 'tel',           label: 'Telephone' },
]

function isMissing(student: Student, key: keyof Student) {
  const v = student[key]
  return !v || String(v).trim() === ''
}

function CardGallery({ students, school, onClose }: {
  students: Student[]
  school: School
  onClose: () => void
}) {
  const [focusId, setFocusId] = useState<string | null>(null)
  const [filterClasse, setFilterClasse] = useState('')
  const [search, setSearch] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  const handlePdfPreview = async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const { default: Doc } = await import('@/components/pdf/CardifyDocument')
      const blob = await pdf(<Doc students={filtered} school={school} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (e) { console.error(e) }
    finally { setPdfLoading(false) }
  }

  const classes = getUniqueClasses(students)

  const filtered = students.filter((s) => {
    const matchClasse = !filterClasse || s.classe === filterClasse
    const q = search.toLowerCase()
    return matchClasse && (!q || s.nom.toLowerCase().includes(q) || s.prenoms.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q))
  })

  const focusStudent = focusId ? filtered.find((s) => s.id === focusId) : null
  const focusIndex = focusStudent ? filtered.indexOf(focusStudent) : -1

  // A4 layout: 2 cols x 4 rows = 8 cards per page
  const CARDS_PER_PAGE = 8
  const pages: Student[][] = []
  for (let i = 0; i < filtered.length; i += CARDS_PER_PAGE) {
    pages.push(filtered.slice(i, i + CARDS_PER_PAGE))
  }

  // Scale: A4 width = 794px, 2 cards side by side with margins
  // Card base width = 600px, we need 2 per row in ~750px usable space
  // scale = 750 / (2 * 600 + gap) ≈ 0.6
  const CARD_SCALE = 0.58

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <Eye size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Visualisation — Format A4</h2>
            <p className="text-gray-400 text-xs">{filtered.length} carte(s) · {pages.length} page(s) · 2×4 par page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
            <X size={15} /> Fermer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-white/10 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#1e3a5f]"
          />
        </div>
        <select
          value={filterClasse}
          onChange={(e) => setFilterClasse(e.target.value)}
          className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="" className="bg-gray-900">Toutes les classes</option>
          {classes.map((c) => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
        </select>
        <span className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">{filtered.length} élève(s)</span>
        {focusStudent && (
          <button onClick={() => setFocusId(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors ml-auto">
            <LayoutGrid size={13} /> Grille A4
          </button>
        )}
      </div>

      {/* Focus view */}
      {focusStudent ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 overflow-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFocusId(filtered[focusIndex - 1]?.id ?? null)}
              disabled={focusIndex === 0}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-gray-300 text-sm min-w-[80px] text-center">{focusIndex + 1} / {filtered.length}</span>
            <button
              onClick={() => setFocusId(filtered[focusIndex + 1]?.id ?? null)}
              disabled={focusIndex === filtered.length - 1}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="drop-shadow-2xl">
            <CardPreview student={focusStudent} school={school} scale={0.9} />
          </div>
          <p className="text-white font-medium text-sm">
            {focusStudent.nom} {focusStudent.prenoms}
            <span className="ml-2 text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{focusStudent.classe || 'Sans classe'}</span>
          </p>
        </div>
      ) : (
        /* A4 pages */
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-10">
          {pages.map((pageCards, pageIdx) => (
            <div key={pageIdx} className="mx-auto" style={{ width: 794 }}>
              {/* Page label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-gray-500 font-medium">Page {pageIdx + 1}</span>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-600">{pageCards.length} carte(s)</span>
              </div>

              {/* A4 sheet */}
              <div style={{
                width: 794,
                minHeight: 1123,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                borderRadius: 2,
                padding: '28px 24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'repeat(4, auto)',
                gap: '20px 16px',
                alignContent: 'start',
              }}>
                {pageCards.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setFocusId(student.id)}
                    className="cursor-pointer group"
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="transition-all duration-200 group-hover:opacity-80 group-hover:scale-[1.01] origin-top-left">
                      <CardPreview student={student} school={school} scale={CARD_SCALE} />
                    </div>
                    <div className="mt-1 flex items-center justify-between px-0.5">
                      <p className="text-[10px] text-gray-400 truncate">{student.nom} {student.prenoms}</p>
                      <div className="flex items-center gap-1">
                        {FIELDS.some(({ key }) => key !== 'tel' && isMissing(student, key)) && (
                          <span className="text-[10px] text-orange-400 flex items-center gap-0.5"><AlertCircle size={9} /> incomplet</span>
                        )}
                        <span className="text-[10px] text-gray-500">{student.classe || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Search size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Aucun élève trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function StudentList() {
  const { students, setStudents, school, setActiveStep, selectedClasse, setSelectedClasse, searchQuery, setSearchQuery } = useStore()
  const [index, setIndex] = useState(0)
  const [editField, setEditField] = useState<keyof Student | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showGallery, setShowGallery] = useState(false)

  const classes = getUniqueClasses(students)
  const filtered = students.filter((s) => {
    const matchClasse = !selectedClasse || s.classe === selectedClasse
    const q = searchQuery.toLowerCase()
    return matchClasse && (!q || s.nom.toLowerCase().includes(q) || s.prenoms.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q))
  })

  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1))
  const current = filtered[safeIndex]
  const missingCount = current ? FIELDS.filter(({ key }) => key !== 'tel' && isMissing(current, key)).length : 0

  const goTo = (i: number) => { setIndex(Math.max(0, Math.min(i, filtered.length - 1))); setEditField(null) }
  const startEdit = (field: keyof Student) => { setEditField(field); setEditValue(String(current?.[field] ?? '')) }
  const saveField = () => {
    if (!editField || !current) return
    setStudents(students.map((s) => s.id === current.id ? { ...s, [editField]: editValue } : s))
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
        <Filters {...{ searchQuery, setSearchQuery, selectedClasse, setSelectedClasse, classes, count: 0 }} />
        <div className="text-center py-16 text-gray-400 text-sm">Aucun eleve trouve</div>
        <div className="flex justify-between"><Button variant="ghost" onClick={() => setActiveStep(2)}>Retour</Button></div>
      </div>
    )
  }

  return (
    <>
      {showGallery && <CardGallery students={filtered} school={school} onClose={() => setShowGallery(false)} />}

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
            <Images size={15} /> Import de photos
          </div>
          <PhotoImporter />
        </div>
        <Filters {...{ searchQuery, setSearchQuery, selectedClasse, setSelectedClasse, classes, count: filtered.length }} />

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* LEFT */}
          <div className="flex flex-col items-center gap-4 w-full xl:w-auto xl:flex-shrink-0 overflow-hidden">
            <div className="flex items-center gap-3">
              <button onClick={() => goTo(safeIndex - 1)} disabled={safeIndex === 0} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center min-w-[90px]">
                <p className="text-sm font-medium text-gray-600">{safeIndex + 1} / {filtered.length}</p>
                {missingCount > 0 && <p className="text-xs text-orange-500 flex items-center justify-center gap-1"><AlertCircle size={10} /> {missingCount} vide(s)</p>}
              </div>
              <button onClick={() => goTo(safeIndex + 1)} disabled={safeIndex === filtered.length - 1} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {current && (
              <div className="w-full overflow-x-auto">
                <div className="transition-all duration-200 mx-auto" style={{ width: 'fit-content' }}>
                  <CardPreview student={current} school={school} scale={0.85} />
                </div>
              </div>
            )}

            <div className="flex gap-1.5 flex-wrap justify-center max-w-[420px]">
              {filtered.map((s, i) => {
                const hasMissing = FIELDS.some(({ key }) => key !== 'tel' && isMissing(s, key))
                return (
                  <button key={s.id} onClick={() => goTo(i)} className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 relative ${i === safeIndex ? 'border-[#1e3a5f] scale-110' : 'border-gray-200 hover:border-gray-400'}`} title={`${s.nom} ${s.prenoms}`}>
                    {s.photoUrl ? <img src={s.photoUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">{s.nom.charAt(0)}</div>}
                    {hasMissing && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-400 rounded-full border border-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT */}
          {current && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{current.nom || '-'} {current.prenoms || ''}</h3>
                <div className="flex items-center gap-2">
                  {missingCount > 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10} /> {missingCount} manquant(s)</span>}
                  <span className="text-xs bg-blue-100 text-[#1e3a5f] px-2.5 py-1 rounded-full font-medium">{current.classe || 'Sans classe'}</span>
                </div>
              </div>

              <div className="space-y-1">
                {FIELDS.map(({ key, label, type }) => {
                  const missing = key !== 'tel' && isMissing(current, key)
                  const isEditing = editField === key
                  return (
                    <div key={key} className={`flex items-center gap-2 py-2 px-3 rounded-lg group border transition-all ${isEditing ? 'border-[#1e3a5f] bg-blue-50' : missing ? 'border-orange-200 bg-orange-50 hover:border-orange-300' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                      <span className={`text-xs w-36 flex-shrink-0 ${missing ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>{label}{missing && ' *'}</span>
                      {isEditing ? (
                        <>
                          {key === 'sexe' ? (
                            <div className="flex gap-2 flex-1">
                              {(['M', 'F'] as const).map((v) => (
                                <button key={v} onClick={() => setEditValue(v)} className={`flex-1 py-1 rounded border text-xs font-medium transition-colors ${editValue === v ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'border-gray-300 text-gray-600'}`}>
                                  {v === 'M' ? 'Masculin' : 'Feminin'}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input type={type ?? 'text'} value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus placeholder={`Saisir ${label.toLowerCase()}...`} onKeyDown={(e) => { if (e.key === 'Enter') saveField(); if (e.key === 'Escape') setEditField(null) }} className="flex-1 border-0 bg-transparent text-sm focus:outline-none placeholder:text-gray-400" />
                          )}
                          <button onClick={saveField} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg flex-shrink-0"><Check size={14} /></button>
                          <button onClick={() => setEditField(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg flex-shrink-0"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <span className={`flex-1 text-sm truncate ${missing ? 'text-orange-400 italic' : key === 'matricule' ? 'text-[#1e3a5f] font-semibold' : 'text-gray-800 font-medium'}`}>
                            {key === 'sexe' ? (current.sexe === 'M' ? 'Masculin' : current.sexe === 'F' ? 'Feminin' : '') : String(current[key] ?? '')}
                            {missing && 'Non renseigne'}
                          </span>
                          <button onClick={() => startEdit(key)} className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${missing ? 'opacity-100 text-orange-400 hover:text-orange-600 hover:bg-orange-100' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50'}`}>
                            {missing ? <PlusCircle size={14} /> : <Edit2 size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}

                {/* Photo */}
                <div className={`flex items-center gap-2 py-2 px-3 rounded-lg border transition-all ${!current.photoUrl ? 'border-orange-200 bg-orange-50' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                  <span className={`text-xs w-36 flex-shrink-0 ${!current.photoUrl ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Photo{!current.photoUrl && ' *'}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                      {current.photoUrl ? <img src={current.photoUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-gray-400" /></div>}
                    </div>
                    <span className={`text-xs ${current.photoUrl ? 'text-gray-500' : 'text-orange-400 italic'}`}>{current.photoUrl ? 'Photo importée' : 'Aucune photo'}</span>
                  </div>
                  <label className="cursor-pointer flex items-center gap-1.5 text-xs text-[#1e3a5f] border border-[#1e3a5f]/30 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0">
                    <Upload size={12} /> {current.photoUrl ? 'Changer' : 'Importer'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f) }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={() => setActiveStep(2)}>Retour</Button>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowGallery(true)}>
              <Eye size={16} /> Voir les cartes ({filtered.length})
            </Button>
            <Button onClick={() => setActiveStep(4)}>
              <FileDown size={16} /> Generer le PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function Filters({ searchQuery, setSearchQuery, selectedClasse, setSelectedClasse, classes, count }: {
  searchQuery: string; setSearchQuery: (v: string) => void
  selectedClasse: string; setSelectedClasse: (v: string) => void
  classes: string[]; count: number
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher un eleve..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
      </div>
      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
        <Filter size={13} className="text-gray-400" />
        <select value={selectedClasse} onChange={(e) => setSelectedClasse(e.target.value)} className="text-sm focus:outline-none bg-transparent">
          <option value="">Toutes les classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">{count} eleve(s)</span>
    </div>
  )
}
