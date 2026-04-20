'use client'
import { useEffect, useState } from 'react'
import type { Student, School } from '@/types'
import { generateQRCode } from '@/lib/qrcode'
import { User } from 'lucide-react'

interface CardPreviewProps {
  student: Student
  school: School
  scale?: number
}

export default function CardPreview({ student, school, scale = 1 }: CardPreviewProps) {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    generateQRCode(`CARDIFY|${student.matricule}|${student.nom}|${student.prenoms}|${school.id}`)
      .then(setQrCode)
      .catch(() => {})
  }, [student.matricule, student.nom, student.prenoms, school.id])

  const theme = school.themeColor || '#1e3a5f'
  const W = 340
  const H = 210

  return (
    <div style={{
      width: W * scale,
      height: H * scale,
      fontFamily: 'Arial, Helvetica, sans-serif',
      border: `${2 * scale}px solid ${theme}`,
      borderRadius: 6 * scale,
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      flexShrink: 0,
      position: 'relative',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        backgroundColor: theme,
        padding: `${5 * scale}px ${8 * scale}px`,
        display: 'flex',
        alignItems: 'center',
        gap: 7 * scale,
        minHeight: 46 * scale,
      }}>
        {/* Logo cercle */}
        <div style={{
          width: 34 * scale, height: 34 * scale,
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: `${1.5 * scale}px solid rgba(255,255,255,0.6)`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {school.logoUrl
            ? <img src={school.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 9 * scale, fontWeight: 'bold', color: theme, textAlign: 'center', lineHeight: 1 }}>CS</span>
          }
        </div>

        {/* Nom + infos ecole */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontSize: 7.5 * scale, fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.25, margin: 0 }}>
            {school.name}
          </p>
          {school.lieu && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 6 * scale, margin: 0, marginTop: 1 * scale }}>
              {school.lieu}
            </p>
          )}
          {school.telephone && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 5.5 * scale, margin: 0 }}>
              Tel : {school.telephone}
            </p>
          )}
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 5.5 * scale, margin: 0 }}>
            Ann. scol. {school.anneeScolaire}
          </p>
        </div>

        {/* Drapeau */}
        {school.flagUrl && (
          <img src={school.flagUrl} alt="flag" style={{
            width: 26 * scale, height: 17 * scale,
            objectFit: 'cover', borderRadius: 2 * scale,
            border: `${scale}px solid rgba(255,255,255,0.4)`,
            flexShrink: 0,
          }} />
        )}
      </div>

      {/* ── BANDE TITRE ── */}
      <div style={{
        backgroundColor: '#1a56db',
        textAlign: 'center',
        padding: `${2.5 * scale}px`,
      }}>
        <p style={{
          color: '#fff', fontSize: 7 * scale, fontWeight: 'bold',
          letterSpacing: 1.2 * scale, textTransform: 'uppercase', margin: 0,
        }}>
          Carte d&apos;Identit&eacute; Scolaire
        </p>
      </div>

      {/* ── CORPS ── */}
      <div style={{
        display: 'flex',
        padding: `${7 * scale}px ${8 * scale}px`,
        gap: 8 * scale,
        flex: 1,
        backgroundColor: '#fff',
      }}>

        {/* Colonne infos */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.8 * scale }}>
          <Row label="Nom et Prenoms" value={`${student.nom} ${student.prenoms}`} scale={scale} />
          <Row label="Ne(e) le" value={student.neLe} scale={scale} />
          <Row label="Lieu de naissance" value={student.lieuNaissance} scale={scale} />
          <Row label="Nationalite" value={student.nationalite} scale={scale} />
          <Row label="Sexe" value={student.sexe === 'M' ? 'Masculin' : 'Feminin'} scale={scale} />
          <Row label="Classe" value={student.classe} scale={scale} />
          {student.tel && <Row label="N Tel" value={student.tel} scale={scale} />}
          <Row label="N Matricule" value={student.matricule} scale={scale} bold />
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * scale, flexShrink: 0, width: 56 * scale }}>
          {/* Photo */}
          <div style={{
            width: 50 * scale, height: 60 * scale,
            border: `${1.5 * scale}px solid ${theme}`,
            borderRadius: 3 * scale,
            overflow: 'hidden',
            backgroundColor: '#f0f4f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {student.photoUrl
              ? <img src={student.photoUrl} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User style={{ width: 26 * scale, height: 26 * scale, color: '#9ca3af' }} />
            }
          </div>

          {/* Signature */}
          <div style={{
            width: 50 * scale, height: 18 * scale,
            border: `${scale}px solid #d1d5db`,
            borderRadius: 2 * scale,
            backgroundColor: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {school.signatureUrl
              ? <img src={school.signatureUrl} alt="sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              : <p style={{ fontSize: 4.5 * scale, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.3 }}>Signature{'\n'}du titulaire</p>
            }
          </div>

          {/* QR */}
          {qrCode && (
            <img src={qrCode} alt="qr" style={{ width: 26 * scale, height: 26 * scale }} />
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        backgroundColor: '#f1f5f9',
        borderTop: `${scale}px solid #e2e8f0`,
        padding: `${2.5 * scale}px ${8 * scale}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: 5.5 * scale, color: '#64748b', margin: 0 }}>
          Delivre le : {school.dateCarteLabel}
        </p>
        {school.adresse && (
          <p style={{ fontSize: 5 * scale, color: '#94a3b8', margin: 0 }}>
            {school.adresse}
          </p>
        )}
        <p style={{ fontSize: 5.5 * scale, color: theme, fontWeight: 'bold', margin: 0 }}>
          {school.anneeScolaire}
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, scale, bold }: { label: string; value: string; scale: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 3 * scale, alignItems: 'baseline' }}>
      <span style={{
        fontSize: 5.5 * scale, color: '#6b7280',
        flexShrink: 0, minWidth: 62 * scale, lineHeight: 1,
      }}>
        {label} :
      </span>
      <span style={{
        fontSize: 6 * scale,
        color: bold ? '#1e3a5f' : '#111827',
        fontWeight: bold ? 'bold' : '500',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>
        {value || '-'}
      </span>
    </div>
  )
}
