'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { fileToDataUrl } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Settings, Upload, Check, Building2, Palette, Image } from 'lucide-react'

export default function SchoolSettings() {
  const { school, setSchool } = useStore()
  const [saved, setSaved] = useState(false)

  const handleImageUpload = async (field: 'logoUrl' | 'flagUrl' | 'signatureUrl', file: File) => {
    const url = await fileToDataUrl(file)
    setSchool({ [field]: url })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-[#1e3a5f]">
        <Settings size={20} />
        <h2 className="text-lg font-semibold">Parametres de l&apos;etablissement</h2>
      </div>

      {/* Section 1 — Identite */}
      <Section icon={<Building2 size={16} />} title="Identite de l'etablissement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;etablissement</label>
            <input
              type="text"
              value={school.name}
              onChange={(e) => setSchool({ name: e.target.value })}
              placeholder="ex: Complexe Scolaire Gloria Dei"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={school.adresse ?? ''}
              onChange={(e) => setSchool({ adresse: e.target.value })}
              placeholder="ex: 12 Rue des Ecoles, Cocody"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu / Ville</label>
            <input
              type="text"
              value={school.lieu ?? ''}
              onChange={(e) => setSchool({ lieu: e.target.value })}
              placeholder="ex: Abidjan, Dakar, Douala"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
            <input
              type="tel"
              value={school.telephone ?? ''}
              onChange={(e) => setSchool({ telephone: e.target.value })}
              placeholder="ex: +225 07 00 00 00"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annee scolaire</label>
            <input
              type="text"
              value={school.anneeScolaire}
              onChange={(e) => setSchool({ anneeScolaire: e.target.value })}
              placeholder="2024-2025"
              className={inp}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de delivrance des cartes</label>
            <input
              type="text"
              value={school.dateCarteLabel}
              onChange={(e) => setSchool({ dateCarteLabel: e.target.value })}
              placeholder="ex: Septembre 2024"
              className={inp}
            />
          </div>
        </div>
      </Section>

      {/* Section 2 — Apparence */}
      <Section icon={<Palette size={16} />} title="Apparence">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couleur theme</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={school.themeColor}
                onChange={(e) => setSchool({ themeColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500 font-mono">{school.themeColor}</span>
            </div>
          </div>
          <div
            className="flex-1 h-10 rounded-lg border border-gray-200"
            style={{ background: `linear-gradient(135deg, ${school.themeColor}, ${school.themeColor}99)` }}
          />
        </div>
      </Section>

      {/* Section 3 — Images */}
      <Section icon={<Image size={16} />} title="Images & Visuels">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUploadField
            label="Logo ecole"
            hint="Format carre recommande"
            value={school.logoUrl}
            onUpload={(f) => handleImageUpload('logoUrl', f)}
            shape="circle"
          />
          <ImageUploadField
            label="Drapeau du pays"
            hint="Format 3:2 recommande"
            value={school.flagUrl}
            onUpload={(f) => handleImageUpload('flagUrl', f)}
          />
          <ImageUploadField
            label="Signature officielle"
            hint="Fond transparent de preference"
            value={school.signatureUrl}
            onUpload={(f) => handleImageUpload('signatureUrl', f)}
          />
        </div>
      </Section>

      <Button onClick={handleSave} size="lg">
        {saved ? <><Check size={16} /> Sauvegarde !</> : <><Check size={16} /> Sauvegarder les parametres</>}
      </Button>
    </div>
  )
}

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-colors'

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-700 font-medium text-sm pb-3 border-b border-gray-100">
        <span className="text-[#1e3a5f]">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function ImageUploadField({
  label, hint, value, onUpload, shape,
}: {
  label: string
  hint?: string
  value?: string
  onUpload: (f: File) => void
  shape?: 'circle'
}) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg'
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden ${shapeClass}`}>
        {value
          ? <img src={value} alt={label} className="w-full h-full object-cover" />
          : <Upload size={20} className="text-gray-400" />
        }
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <label className="cursor-pointer text-xs text-[#1e3a5f] underline hover:text-[#16304f]">
        {value ? 'Changer' : 'Importer'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
        />
      </label>
    </div>
  )
}
