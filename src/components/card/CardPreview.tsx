'use client'
import { useEffect, useState } from 'react'
import type { Student, School } from '@/types'
import { generateQRCode } from '@/lib/qrcode'
import { User, QrCode } from 'lucide-react'

interface CardPreviewProps {
  student: Student
  school: School
  scale?: number
}

export default function CardPreview({ student, school, scale = 1 }: CardPreviewProps) {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    generateQRCode(`CARDIFY|${student.matricule}|${student.nom}|${student.prenoms}|${student.classe}|${school.name}|${school.anneeScolaire}`)
      .then(setQrCode)
      .catch(() => {})
  }, [student.matricule, student.nom, student.prenoms, student.classe, school.name, school.anneeScolaire])

  const theme = school.themeColor || '#000080'
  const W = 340
  const H = 204

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 * scale }}>
      {/* ── CARTE ── */}
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
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* HEADER */}
        <div style={{
          backgroundColor: theme,
          padding: `${3 * scale}px ${6 * scale}px`,
          display: 'flex',
          alignItems: 'center',
          gap: 5 * scale,
        }}>
          <div style={{
            width: 22 * scale, height: 22 * scale,
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: `${1.5 * scale}px solid rgba(255,255,255,0.6)`,
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {school.logoUrl
              ? <img src={school.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 6 * scale, fontWeight: 'bold', color: theme, lineHeight: 1 }}>CS</span>
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 6 * scale, fontWeight: 'bold', textTransform: 'uppercase', lineHeight: 1.2, margin: 0 }}>
              {school.name}
            </p>
            {school.lieu && (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 5 * scale, margin: 0, marginTop: 0.5 * scale }}>
                {school.lieu}
              </p>
            )}
            {school.telephone && (
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 4.5 * scale, margin: 0 }}>
                Tel : {school.telephone}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 4.5 * scale, margin: 0 }}>
              Ann. scol. {school.anneeScolaire}
            </p>
          </div>

          {school.flagUrl && (
            <img src={school.flagUrl} alt="flag" style={{
              width: 20 * scale, height: 13 * scale,
              objectFit: 'cover', borderRadius: 1.5 * scale,
              border: `${scale}px solid rgba(255,255,255,0.4)`,
              flexShrink: 0,
            }} />
          )}
        </div>

        {/* TITRE — sans fond bleu, juste texte sur fond blanc avec bordure */}
        <div style={{
          borderBottom: `${scale}px solid ${theme}`,
          textAlign: 'center',
          padding: `${2 * scale}px`,
          backgroundColor: '#fff',
        }}>
          <p style={{
            color: theme, fontSize: 6 * scale, fontWeight: 'bold',
            letterSpacing: 1 * scale, textTransform: 'uppercase', margin: 0,
          }}>
            Carte d&apos;Identit&eacute; Scolaire
          </p>
        </div>

        {/* CORPS */}
        <div style={{
          display: 'flex',
          padding: `${5 * scale}px ${6 * scale}px`,
          gap: 6 * scale,
          backgroundColor: '#fff',
          flex: 1,
        }}>
          {/* Infos */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.2 * scale }}>
            <Row label="Nom et Prenoms" value={`${student.nom} ${student.prenoms}`} scale={scale} />
            <Row label="Ne(e) le" value={student.neLe} scale={scale} />
            <Row label="Lieu de naissance" value={student.lieuNaissance} scale={scale} />
            <Row label="Nationalite" value={student.nationalite} scale={scale} />
            <Row label="Sexe" value={student.sexe === 'M' ? 'Masculin' : 'Feminin'} scale={scale} />
            <Row label="Classe" value={student.classe} scale={scale} />
            {student.tel && <Row label="N Tel" value={student.tel} scale={scale} />}
            <Row label="N Matricule" value={student.matricule} scale={scale} bold color={theme} />
          </div>

          {/* Photo + Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * scale, flexShrink: 0, width: 50 * scale }}>
            <div style={{
              width: 44 * scale, height: 58 * scale,
              border: `${1.5 * scale}px solid ${theme}`,
              borderRadius: 2 * scale,
              overflow: 'hidden',
              backgroundColor: '#f0f4f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {student.photoUrl
                ? <img src={student.photoUrl} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User style={{ width: 22 * scale, height: 22 * scale, color: '#9ca3af' }} />
              }
            </div>

            <div style={{
              width: 44 * scale, height: 16 * scale,
              border: `${scale}px solid #d1d5db`,
              borderRadius: 2 * scale,
              backgroundColor: '#f9fafb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {school.signatureUrl
                ? <img src={school.signatureUrl} alt="sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : <p style={{ fontSize: 4 * scale, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.3 }}>
                    Signature{'\n'}du titulaire
                  </p>
              }
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          backgroundColor: '#f1f5f9',
          borderTop: `${scale}px solid #e2e8f0`,
          padding: `${2 * scale}px ${6 * scale}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: 4.5 * scale, color: '#64748b', margin: 0 }}>
            Delivre le : {school.dateCarteLabel}
          </p>
          {school.adresse && (
            <p style={{ fontSize: 4 * scale, color: '#94a3b8', margin: 0 }}>{school.adresse}</p>
          )}
          <p style={{ fontSize: 4.5 * scale, color: theme, fontWeight: 'bold', margin: 0 }}>
            {school.anneeScolaire}
          </p>
        </div>
      </div>

      {/* ── QR CODE A COTE ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6 * scale,
        paddingTop: 8 * scale,
        flexShrink: 0,
      }}>
        {qrCode ? (
          <>
            <img
              src={qrCode}
              alt="QR Code"
              style={{
                width: 64 * scale,
                height: 64 * scale,
                border: `${scale}px solid #e2e8f0`,
                borderRadius: 4 * scale,
                padding: 3 * scale,
                backgroundColor: '#fff',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 5.5 * scale, color: '#374151', fontWeight: 'bold', margin: 0 }}>
                Scanner pour
              </p>
              <p style={{ fontSize: 5 * scale, color: '#6b7280', margin: 0 }}>
                verifier l&apos;eleve
              </p>
            </div>
          </>
        ) : (
          <div style={{
            width: 64 * scale, height: 64 * scale,
            backgroundColor: '#f3f4f6',
            borderRadius: 4 * scale,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QrCode style={{ width: 28 * scale, height: 28 * scale, color: '#d1d5db' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, scale, bold, color }: { label: string; value: string; scale: number; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 * scale, alignItems: 'baseline' }}>
      <span style={{ fontSize: 4.5 * scale, color: '#6b7280', flexShrink: 0, minWidth: 55 * scale, lineHeight: 1 }}>
        {label} :
      </span>
      <span style={{
        fontSize: 5 * scale,
        color: color ?? (bold ? '#000080' : '#111827'),
        fontWeight: bold ? 'bold' : '500',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>
        {value || '-'}
      </span>
    </div>
  )
}
