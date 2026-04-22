'use client'
import { useState } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { fileToDataUrl } from '@/lib/utils'
import {
  Settings, Building2, Palette, Image, Pencil, X, Check,
  MapPin, Phone, Calendar, Upload, User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type ModalType = 'profile' | 'identity' | 'appearance' | 'images' | null

export default function SchoolSettings({ onEditProfile }: { onEditProfile?: () => void }) {
  const { school } = useStore()
  const { user } = useAuth()
  const [modal, setModal] = useState<ModalType>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[#1e3a5f]">
        <Settings size={20} />
        <h2 className="text-lg font-semibold">Paramètres</h2>
      </div>

      {/* ── Profil ── */}
      <Card icon={<User size={15} />} title="Profil" onEdit={() => onEditProfile?.()}>
        <Row label="Nom" value={user?.name} />
        <Row label="Email" value={user?.email} />
        <Row label="Rôle" value={user?.role} />
      </Card>

      {/* ── Identité ── */}
      <Card icon={<Building2 size={15} />} title="Identité de l'établissement" onEdit={() => setModal('identity')}>
        <Row label="Nom" value={school.name} />
        <Row label="Adresse" value={school.adresse} />
        <Row label="Ville" value={school.lieu} />
        <Row label="Téléphone" value={school.telephone} />
        <Row label="Année scolaire" value={school.anneeScolaire} />
        <Row label="Date des cartes" value={school.dateCarteLabel} />
      </Card>

      {/* ── Apparence ── */}
      <Card icon={<Palette size={15} />} title="Apparence" onEdit={() => setModal('appearance')}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{ background: school.themeColor }} />
          <span className="text-sm text-gray-700 font-mono">{school.themeColor}</span>
          <span className="text-xs text-gray-400">Couleur thème</span>
        </div>
      </Card>

      {/* ── Images ── */}
      <Card icon={<Image size={15} />} title="Images & Visuels" onEdit={() => setModal('images')}>
        <div className="flex items-center gap-6">
          <ImageThumb label="Logo" value={school.logoUrl} circle />
          <ImageThumb label="Drapeau" value={school.flagUrl} />
          <ImageThumb label="Signature" value={school.signatureUrl} />
        </div>
      </Card>

      <AnimatePresence>
        {modal && (
          <Modal onClose={() => setModal(null)}>
            {modal === 'identity'   && <IdentityForm   onClose={() => setModal(null)} />}
            {modal === 'appearance' && <AppearanceForm onClose={() => setModal(null)} />}
            {modal === 'images'     && <ImagesForm     onClose={() => setModal(null)} />}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Card({ icon, title, onEdit, children }: {
  icon: React.ReactNode; title: string; onEdit: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold text-sm">{icon} {title}</div>
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1e3a5f] border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 px-3 py-1.5 rounded-lg transition-colors">
          <Pencil size={12} /> Modifier
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium">{value || <span className="text-gray-300 italic">Non renseigné</span>}</span>
    </div>
  )
}

function ImageThumb({ label, value, circle }: { label: string; value?: string; circle?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-14 h-14 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center ${circle ? 'rounded-full' : 'rounded-lg'}`}>
        {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : <Upload size={16} className="text-gray-300" />}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors'

function ModalHeader({ title, icon, onClose }: { title: string; icon: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold text-sm">{icon} {title}</div>
      <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={16} /></button>
    </div>
  )
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#1e3a5f] hover:bg-[#16304f] text-white'}`}>
      <Check size={15} /> {saved ? 'Sauvegardé !' : 'Sauvegarder'}
    </button>
  )
}

function IdentityForm({ onClose }: { onClose: () => void }) {
  const { school, setSchool } = useStore()
  const [form, setForm] = useState({ ...school })
  const [saved, setSaved] = useState(false)

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const save = () => {
    setSchool(form)
    setSaved(true)
    toast.success('Identité mise à jour')
    setTimeout(() => { setSaved(false); onClose() }, 1000)
  }

  return (
    <>
      <ModalHeader title="Identité de l'établissement" icon={<Building2 size={15} />} onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <Field label="Nom de l'établissement" icon={<Building2 size={13} />}>
          <input className={inp} value={form.name} onChange={f('name')} placeholder="ex: Complexe Scolaire Gloria Dei" />
        </Field>
        <Field label="Adresse" icon={<MapPin size={13} />}>
          <input className={inp} value={form.adresse ?? ''} onChange={f('adresse')} placeholder="ex: 12 Rue des Écoles, Cocody" />
        </Field>
        <Field label="Ville / Lieu" icon={<MapPin size={13} />}>
          <input className={inp} value={form.lieu ?? ''} onChange={f('lieu')} placeholder="ex: Abidjan" />
        </Field>
        <Field label="Téléphone" icon={<Phone size={13} />}>
          <input className={inp} value={form.telephone ?? ''} onChange={f('telephone')} placeholder="ex: +225 07 00 00 00" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Année scolaire" icon={<Calendar size={13} />}>
            <input className={inp} value={form.anneeScolaire} onChange={f('anneeScolaire')} placeholder="2024-2025" />
          </Field>
          <Field label="Date des cartes" icon={<Calendar size={13} />}>
            <input className={inp} value={form.dateCarteLabel} onChange={f('dateCarteLabel')} placeholder="Septembre 2024" />
          </Field>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
        <SaveButton saved={saved} onClick={save} />
      </div>
    </>
  )
}

function AppearanceForm({ onClose }: { onClose: () => void }) {
  const { school, setSchool } = useStore()
  const [color, setColor] = useState(school.themeColor)
  const [colorInput, setColorInput] = useState(school.themeColor)
  const [saved, setSaved] = useState(false)

  const applyInput = (val: string) => {
    const hex = val.startsWith('#') ? val : `#${val}`
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) { setColor(hex); setColorInput(hex) }
  }

  const save = () => {
    setSchool({ themeColor: color })
    setSaved(true)
    toast.success('Couleur thème mise à jour')
    setTimeout(() => { setSaved(false); onClose() }, 1000)
  }

  return (
    <>
      <ModalHeader title="Apparence" icon={<Palette size={15} />} onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <Field label="Couleur thème" icon={<Palette size={13} />}>
          <div className="flex items-center gap-3">
            <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setColorInput(e.target.value) }} className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0" />
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onBlur={(e) => applyInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applyInput(colorInput) }} placeholder="#000080" maxLength={7} className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-colors" />
          </div>
        </Field>
        <div className="h-12 rounded-xl border border-gray-200" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }} />
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
        <SaveButton saved={saved} onClick={save} />
      </div>
    </>
  )
}

function ImagesForm({ onClose }: { onClose: () => void }) {
  const { school, setSchool } = useStore()
  const [previews, setPreviews] = useState({ logoUrl: school.logoUrl, flagUrl: school.flagUrl, signatureUrl: school.signatureUrl })
  const [saved, setSaved] = useState(false)

  const handleFile = async (field: keyof typeof previews, file: File) => {
    const url = await fileToDataUrl(file)
    setPreviews((p) => ({ ...p, [field]: url }))
  }

  const save = () => {
    setSchool(previews)
    setSaved(true)
    toast.success('Images mises à jour')
    setTimeout(() => { setSaved(false); onClose() }, 1000)
  }

  return (
    <>
      <ModalHeader title="Images & Visuels" icon={<Image size={15} />} onClose={onClose} />
      <div className="px-6 py-5">
        <div className="grid grid-cols-3 gap-6">
          <UploadField label="Logo école" hint="Carré recommandé" value={previews.logoUrl} circle onUpload={(f) => handleFile('logoUrl', f)} />
          <UploadField label="Drapeau" hint="Format 3:2" value={previews.flagUrl} onUpload={(f) => handleFile('flagUrl', f)} />
          <UploadField label="Signature" hint="Fond transparent" value={previews.signatureUrl} onUpload={(f) => handleFile('signatureUrl', f)} />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
        <SaveButton saved={saved} onClick={save} />
      </div>
    </>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        <span className="text-[#1e3a5f]">{icon}</span> {label}
      </label>
      {children}
    </div>
  )
}

function UploadField({ label, hint, value, onUpload, circle }: {
  label: string; hint?: string; value?: string; onUpload: (f: File) => void; circle?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center ${circle ? 'rounded-full' : 'rounded-xl'}`}>
        {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-300" />}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      </div>
      <label className="cursor-pointer text-xs font-medium text-[#1e3a5f] border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 px-3 py-1 rounded-lg transition-colors">
        {value ? 'Changer' : 'Importer'}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
      </label>
    </div>
  )
}
