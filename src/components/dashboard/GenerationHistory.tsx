'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Clock, FileText, Loader2 } from 'lucide-react'

interface HistoryEntry {
  id: string
  schoolId: string
  studentCount: number
  classeFilter?: string | null
  createdAt: string
}

export default function GenerationHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.schoolId) return
    fetch(`/api/generate?schoolId=${user.schoolId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setHistory(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.schoolId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Chargement...
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Aucune generation pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div key={entry.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <FileText size={20} className="text-[#1e3a5f] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {entry.studentCount} carte(s) generee(s)
              {entry.classeFilter && ` — Classe : ${entry.classeFilter}`}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(entry.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
