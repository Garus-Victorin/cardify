'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { mapRowsToStudents } from '@/lib/excel'
import Button from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

const REQUIRED_FIELDS = [
  { key: 'matricule', label: 'N° Matricule', required: true },
  { key: 'nom', label: 'Nom', required: true },
  { key: 'prenoms', label: 'Prénoms', required: true },
  { key: 'neLe', label: 'Né(e) le', required: true },
  { key: 'lieuNaissance', label: 'Lieu de naissance', required: true },
  { key: 'nationalite', label: 'Nationalité', required: true },
  { key: 'sexe', label: 'Sexe', required: true },
  { key: 'classe', label: 'Classe', required: true },
  { key: 'tel', label: 'N° Téléphone', required: false },
  { key: 'photo', label: 'Photo (nom fichier)', required: false },
] as const

export default function ColumnMapper() {
  const { rawHeaders, setColumnMapping, setStudents, setActiveStep, school } = useStore()
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const autoDetect = () => {
    const auto: Record<string, string> = {}
    const patterns: Record<string, RegExp> = {
      matricule: /matricule|mat[^r]|n°\s*mat/i,
      nom: /^nom$/i,
      prenoms: /pr[eé]nom/i,
      neLe: /n[eé]\s*(le|date)|date.*naiss/i,
      lieuNaissance: /lieu|naissance/i,
      nationalite: /national/i,
      sexe: /sexe|genre/i,
      classe: /classe|niveau/i,
      tel: /t[eé]l|phone|contact/i,
      photo: /photo|image|fichier/i,
    }
    rawHeaders.forEach((h) => {
      Object.entries(patterns).forEach(([field, regex]) => {
        if (!auto[field] && regex.test(h)) auto[field] = h
      })
    })
    setMapping(auto)
  }

  const handleSubmit = () => {
    const required = REQUIRED_FIELDS.filter((f) => f.required).map((f) => f.key)
    const missing = required.filter((k) => !mapping[k])
    if (missing.length > 0) {
      setError(`Champs obligatoires non mappés : ${missing.join(', ')}`)
      return
    }
    setError('')
    const rawRows = JSON.parse(sessionStorage.getItem('cardify_rows') ?? '[]')
    const students = mapRowsToStudents(rawRows, mapping as never, school.id)
    setStudents(students)
    setColumnMapping(mapping as never)
    setActiveStep(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Associez chaque champ de la carte à une colonne de votre fichier Excel.
        </p>
        <Button variant="secondary" size="sm" onClick={autoDetect}>
          Détection automatique
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_FIELDS.map(({ key, label, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={mapping[key] ?? ''}
              onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              <option value="">-- Sélectionner une colonne --</option>
              {rawHeaders.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setActiveStep(0)}>Retour</Button>
        <Button onClick={handleSubmit}>
          Continuer <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
