'use client'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { validateStudents } from '@/lib/excel'
import Button from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'

export default function ValidationPanel() {
  const { students, validationErrors, setValidationErrors, setActiveStep } = useStore()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const errors = validateStudents(students)
    setValidationErrors(errors)
  }, [students, setValidationErrors])

  const duplicates = validationErrors.filter((e) => e.type === 'duplicate_matricule').length
  const missingFields = validationErrors.filter((e) => e.type === 'missing_field').length
  const canContinue = missingFields === 0 && duplicates === 0

  const handleContinue = async () => {
    if (!canContinue) return
    // Save students to DB before proceeding
    if (user?.schoolId && students.length > 0) {
      setSaving(true)
      try {
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ schoolId: user.schoolId, students }),
        })
      } catch (e) {
        console.error('[ValidationPanel] save error', e)
      } finally {
        setSaving(false)
      }
    }
    setActiveStep(3)
  }

  return (
    <div className="space-y-6">
      {validationErrors.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle size={24} />
          <div>
            <p className="font-semibold">Validation réussie !</p>
            <p className="text-sm">Toutes les données sont correctes. Vous pouvez continuer.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            <AlertTriangle size={24} />
            <div>
              <p className="font-semibold">Erreurs détectées</p>
              <p className="text-sm">{validationErrors.length} problème(s) trouvé(s)</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            {duplicates > 0 && (
              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <p className="text-2xl font-bold text-red-600">{duplicates}</p>
                <p className="text-xs text-gray-600 mt-1">Matricules dupliqués</p>
              </div>
            )}
            {missingFields > 0 && (
              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <p className="text-2xl font-bold text-red-600">{missingFields}</p>
                <p className="text-xs text-gray-600 mt-1">Champs manquants</p>
              </div>
            )}
          </div>

          {/* Error list */}
          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {validationErrors
              .filter((e) => e.type !== 'missing_photo')
              .map((err, i) => (
              <div
                key={i}
                className="text-sm p-2 rounded bg-red-50 text-red-700"
              >
                {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setActiveStep(1)}>Retour</Button>
        <Button disabled={!canContinue || saving} loading={saving} onClick={handleContinue}>
          {canContinue ? (
            <>
              {saving ? 'Sauvegarde...' : 'Continuer'} {!saving && <ArrowRight size={16} />}
            </>
          ) : (
            'Corrigez les erreurs pour continuer'
          )}
        </Button>
      </div>
    </div>
  )
}
