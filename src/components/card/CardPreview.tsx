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

const BASE_W = 600

export default function CardPreview({ student, school, scale = 1 }: CardPreviewProps) {
  const [qrCode, setQrCode] = useState('')
  const s = scale

  useEffect(() => {
    generateQRCode(
      `CARDIFY|${student.matricule}|${student.nom}|${student.prenoms}|${student.classe}|${school.name}|${school.anneeScolaire}`
    ).then(setQrCode).catch(() => {})
  }, [student.matricule, student.nom, student.prenoms, student.classe, school.name, school.anneeScolaire])

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 * s }}>
      {/* CARTE */}
      <div style={{
        width: BASE_W * s,
        background: '#fff',
        border: `${1 * s}px solid #ddd`,
        padding: `${10 * s}px ${12 * s}px ${14 * s}px`,
        color: '#111',
        position: 'relative',
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}>

        {/* ── TOP : logo | infos école | drapeau ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10 * s,
        }}>
          {/* Logo */}
          <div style={{
            width: 70 * s,
            height: 70 * s,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {school.logoUrl
              ? <img src={school.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 * s, color: '#9ca3af', fontWeight: 'bold' }}>LOGO</div>
            }
          </div>

          {/* Infos école */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            lineHeight: 1.25,
            fontSize: 16 * s,
            fontWeight: 500,
            paddingTop: 2 * s,
          }}>
            <div>{school.name}</div>
            {school.adresse && <div style={{ fontSize: 14 * s, marginTop: 2 * s }}>{school.adresse}{school.telephone ? ` — Tél : ${school.telephone}` : ''}</div>}
            {school.lieu && <div style={{ fontSize: 14 * s, marginTop: 2 * s }}>{school.lieu}</div>}
          </div>

          {/* Drapeau */}
          <div style={{
            width: 70 * s,
            height: 70 * s,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {school.flagUrl
              ? <img src={school.flagUrl} alt="Drapeau" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', border: `${0.5 * s}px solid #d1d5db` }}>
                  <div style={{ width: '33.3%', background: '#008751' }} />
                  <div style={{ width: '33.3%', background: '#FCD116' }} />
                  <div style={{ width: '33.4%', background: '#E8112D' }} />
                </div>
            }
          </div>
        </div>

        {/* ── TITRE ── */}
        <div style={{
          marginTop: 6 * s,
          background: school.themeColor,
          color: '#fff',
          textAlign: 'center',
          fontSize: 28 * s,
          fontWeight: 800,
          padding: `${6 * s}px ${10 * s}px`,
          letterSpacing: 0.5,
        }}>
          CARTE D&apos;IDENTITE SCOLAIRE
        </div>

        {/* ── CONTENU ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `1fr ${100 * s}px ${98 * s}px`,
          gap: 14 * s,
          marginTop: 10 * s,
          alignItems: 'start',
        }}>

          {/* GAUCHE — champs */}
          <div style={{ fontSize: 18 * s, lineHeight: 1.45 }}>
            <Row label="Nom et prénoms" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.nom} {student.prenoms}</span>
            </Row>
            <Row label="Né(e) le" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.neLe}</span>
              {student.lieuNaissance && <span style={{ fontSize: 17 * s }}> à {student.lieuNaissance}</span>}
            </Row>
            <Row label="Nationalité" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.nationalite || '—'}</span>
            </Row>
            <Row label="Sexe" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>
                {student.sexe === 'M' ? 'Masculin' : student.sexe === 'F' ? 'Féminin' : '—'}
              </span>
            </Row>
            <Row label="Classe" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.classe || '—'}</span>
            </Row>
            <Row label="N° Tél" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.tel || ''}</span>
            </Row>
            <Row label="N° Matricule" s={s}>
              <span style={{ fontWeight: 700, fontSize: 17 * s }}>{student.matricule}</span>
            </Row>
          </div>

          {/* CENTRE — signature */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}>
            <div style={{
              width: 98 * s,
              height: 70 * s,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 8 * s,
              border: school.signatureUrl ? 'none' : `${1 * s}px dashed #bbb`,
            }}>
              {school.signatureUrl
                ? <img src={school.signatureUrl} alt="signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} />
                : <span style={{ fontStyle: 'italic', textDecoration: 'underline', fontSize: 11 * s, color: '#222' }}>Signature du titulaire</span>
              }
            </div>
          </div>

          {/* DROITE — photo + année */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8 * s,
          }}>
            {/* Date */}
            <div style={{ fontSize: 13 * s, color: '#111', textAlign: 'center' }}>
              {school.dateCarteLabel}
            </div>

            {/* Photo */}
            <div style={{
              width: 98 * s,
              height: 118 * s,
              background: '#ddd',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {student.photoUrl
                ? <img src={student.photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User style={{ width: 36 * s, height: 36 * s, color: '#9ca3af' }} />
              }
            </div>

            {/* Année scolaire */}
            <div style={{ textAlign: 'center', fontSize: 10 * s, lineHeight: 1.1 }}>
              ANNEE SCOLAIRE
              <strong style={{ display: 'block', fontSize: 18 * s }}>{school.anneeScolaire}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* QR CODE — à côté de la carte */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6 * s,
        paddingTop: 20 * s,
      }}>
        {qrCode ? (
          <>
            <div style={{
              padding: 4 * s,
              background: '#fff',
              border: `${s}px solid #e2e8f0`,
              borderRadius: 4 * s,
              boxShadow: `0 ${1 * s}px ${4 * s}px rgba(0,0,0,0.08)`,
            }}>
              <img src={qrCode} alt="QR" style={{ width: 70 * s, height: 70 * s, display: 'block' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 6 * s, color: '#374151', fontWeight: 'bold', margin: 0 }}>Scanner</p>
              <p style={{ fontSize: 5 * s, color: '#6b7280', margin: 0 }}>pour vérifier</p>
            </div>
          </>
        ) : (
          <div style={{
            width: 78 * s,
            height: 78 * s,
            background: '#f3f4f6',
            borderRadius: 4 * s,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <QrCode style={{ width: 32 * s, height: 32 * s, color: '#d1d5db' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, s, children }: { label: string; s: number; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 10 * s,
      marginBottom: 8 * s,
      flexWrap: 'wrap',
    }}>
      <span style={{
        minWidth: 120 * s,
        textDecoration: 'underline',
        fontSize: 17 * s,
        flexShrink: 0,
      }}>
        {label} :
      </span>
      {children}
    </div>
  )
}
