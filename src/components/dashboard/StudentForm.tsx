'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { fileToDataUrl, nanoid } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { Student } from '@/types'
import { UserPlus, Trash2, Edit2, Check, X, Upload, User, ArrowRight } from 'lucide-react'

const EMPTY_FORM = {
  nom: '',
  prenoms: '',
  neLe: '',
  lieuNaissance: '',
  nationalite: '',
  sexe: 'M' as 'M' | 'F',
  classe: '',
  tel: '',
  matricule: '',
  photoUrl: '',
}

export default function StudentForm() {
  const { students, setStudents, school, setActiveStep } = useStore()
  const { user } = useAuth()
  const schoolId = user?.schoolId ?? school.id
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editId, setEditId] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.matricule.trim()) e.matricule = 'Requis'
    if (!form.nom.trim()) e.nom = 'Requis'
    if (!form.prenoms.trim()) e.prenoms = 'Requis'
    if (!form.neLe.trim()) e.neLe = 'Requis'
    if (!form.lieuNaissance.trim()) e.lieuNaissance = 'Requis'
    if (!form.nationalite.trim()) e.nationalite = 'Requis'
    if (!form.classe.trim()) e.classe = 'Requis'
    // Check duplicate matricule
    const dup = students.find((s) => s.matricule === form.matricule.trim() && s.id !== editId)
    if (dup) e.matricule = 'Matricule deja utilise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePhotoUpload = async (file: File) => {
    const url = await fileToDataUrl(file)
    setPhotoPreview(url)
    setForm((p) => ({ ...p, photoUrl: url }))
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (editId) {
      setStudents(students.map((s) =>
        s.id === editId
          ? { ...s, ...form, photoUrl: form.photoUrl || s.photoUrl }
          : s
      ))
      setEditId(null)
    } else {
      const newStudent: Student = {
        id: nanoid(),
        schoolId,
        ...form,
        photoUrl: form.photoUrl || undefined,
      }
      setStudents([...students, newStudent])
    }
    setForm({ ...EMPTY_FORM })
    setPhotoPreview('')
  }

  const handleEdit = (s: Student) => {
    setEditId(s.id)
    setForm({
      nom: s.nom,
      prenoms: s.prenoms,
      neLe: s.neLe,
      lieuNaissance: s.lieuNaissance,
      nationalite: s.nationalite,
      sexe: s.sexe,
      classe: s.classe,
      tel: s.tel ?? '',
      matricule: s.matricule,
      photoUrl: s.photoUrl ?? '',
    })
    setPhotoPreview(s.photoUrl ?? '')
  }

  const handleDelete = (id: string) => {
    setStudents(students.filter((s) => s.id !== id))
    if (editId === id) { setEditId(null); setForm({ ...EMPTY_FORM }); setPhotoPreview('') }
  }

  const handleCancel = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setPhotoPreview('')
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          {editId ? <><Edit2 size={15} /> Modifier l&apos;eleve</> : <><UserPlus size={15} /> Ajouter un eleve</>}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matricule */}
          <Field label="N° Matricule" required error={errors.matricule}>
            <input
              value={form.matricule}
              onChange={(e) => set('matricule', e.target.value)}
              placeholder="ex: 2024001"
              className={input(errors.matricule)}
            />
          </Field>

          {/* Classe */}
          <Field label="Classe" required error={errors.classe}>
            <input
              value={form.classe}
              onChange={(e) => set('classe', e.target.value)}
              placeholder="ex: 6eme A, Terminale C"
              className={input(errors.classe)}
            />
          </Field>

          {/* Nom */}
          <Field label="Nom" required error={errors.nom}>
            <input
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              placeholder="Nom de famille"
              className={input(errors.nom)}
            />
          </Field>

          {/* Prenoms */}
          <Field label="Prenoms" required error={errors.prenoms}>
            <input
              value={form.prenoms}
              onChange={(e) => set('prenoms', e.target.value)}
              placeholder="Prenoms complets"
              className={input(errors.prenoms)}
            />
          </Field>

          {/* Date de naissance */}
          <Field label="Date de naissance" required error={errors.neLe}>
            <input
              type="date"
              value={form.neLe}
              onChange={(e) => set('neLe', e.target.value)}
              className={input(errors.neLe)}
            />
          </Field>

          {/* Lieu de naissance */}
          <Field label="Lieu de naissance" required error={errors.lieuNaissance}>
            <input
              value={form.lieuNaissance}
              onChange={(e) => set('lieuNaissance', e.target.value)}
              placeholder="ex: Cotonou, Porto-Novo"
              className={input(errors.lieuNaissance)}
            />
          </Field>

          {/* Nationalite */}
          <Field label="Nationalite" required error={errors.nationalite}>
            <input
              value={form.nationalite}
              onChange={(e) => set('nationalite', e.target.value)}
              placeholder="ex: Béninoise, Togolaise"
              className={input(errors.nationalite)}
            />
          </Field>

          {/* Sexe */}
          <Field label="Sexe" required>
            <div className="flex gap-3">
              {(['M', 'F'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('sexe', s)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    form.sexe === s
                      ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#1e3a5f]'
                  }`}
                >
                  {s === 'M' ? 'Masculin' : 'Feminin'}
                </button>
              ))}
            </div>
          </Field>

          {/* Tel */}
          <Field label="N° Telephone (optionnel)">
            <input
              value={form.tel}
              onChange={(e) => set('tel', e.target.value)}
              placeholder="ex: +229 07 00 00 00"
              className={input()}
            />
          </Field>

          {/* Photo */}
          <Field label="Photo (optionnel)">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  : <User size={20} className="text-gray-400" />
                }
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-[#1e3a5f] hover:bg-blue-50 transition-colors text-sm text-gray-500">
                  <Upload size={14} />
                  {photoPreview ? 'Changer la photo' : 'Importer une photo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }}
                />
              </label>
            </div>
          </Field>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
          <Button onClick={handleSubmit} size="sm">
            <Check size={14} />
            {editId ? 'Enregistrer les modifications' : 'Ajouter l\'eleve'}
          </Button>
          {editId && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X size={14} /> Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Student list */}
      {students.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{students.length} eleve(s) ajoute(s)</p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2">
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group">
                <span className="text-xs text-gray-400 w-5 text-center">{i + 1}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {s.photoUrl
                    ? <img src={s.photoUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs"><User size={14} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.nom} {s.prenoms}</p>
                  <p className="text-xs text-gray-400">{s.classe} &middot; {s.matricule}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(s)}
                    className="p-1.5 text-gray-400 hover:text-[#1e3a5f] hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setActiveStep(2)}>
              Continuer <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, error, children }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function input(error?: string) {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`
}
