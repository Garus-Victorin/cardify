import React from 'react'
import * as PDF from '@react-pdf/renderer'
import type { Student, School } from '@/types'
import { chunkArray } from '@/lib/utils'

const ce = React.createElement
function PdfDoc(p: React.ComponentProps<typeof PDF.Document>) { return ce(PDF.Document as unknown as React.ElementType, p) }
function PdfPage(p: React.ComponentProps<typeof PDF.Page>) { return ce(PDF.Page as unknown as React.ElementType, p) }
function PdfView(p: React.ComponentProps<typeof PDF.View>) { return ce(PDF.View as unknown as React.ElementType, p) }
function PdfText(p: React.ComponentProps<typeof PDF.Text>) { return ce(PDF.Text as unknown as React.ElementType, p) }
function PdfImage(p: React.ComponentProps<typeof PDF.Image>) { return ce(PDF.Image as unknown as React.ElementType, p) }

const BLUE = '#003087'

// Card: 210 x 133 pt (A4 width / 2 with margins, ratio ~1.58)
const CARD_W = 210
const CARD_H = 133

const S = PDF.StyleSheet.create({
  page: {
    backgroundColor: '#f0f2f5',
    padding: '20pt 15pt',
    flexDirection: 'column',
    gap: 14,
  },
  pageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#ffffff',
    border: '1pt solid #c0c8d8',
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '4pt 5pt 3pt',
    gap: 4,
    backgroundColor: '#fff',
    borderBottom: '0.5pt solid #e5e7eb',
    minHeight: 28,
  },
  logoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    border: '1.5pt solid #1a1a2e',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoText: { fontSize: 4, fontWeight: 'bold', color: '#1a1a2e' },
  schoolCenter: { flex: 1, alignItems: 'center' },
  schoolName: { fontSize: 5.5, fontWeight: 'bold', color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 0.3 },
  schoolSub: { fontSize: 4, color: '#4b5563', marginTop: 0.5 },
  flag: { width: 18, height: 12, border: '0.5pt solid #d1d5db', borderRadius: 1 },
  flagBenin: { width: 18, height: 12, flexDirection: 'row', border: '0.5pt solid #d1d5db', borderRadius: 1, overflow: 'hidden' },

  // Title band
  titleBand: {
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3.5pt 5pt',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // Body
  body: {
    flexDirection: 'row',
    flex: 1,
    padding: '4pt 5pt 3pt',
    gap: 5,
  },

  // Left col — fields
  leftCol: { flex: 1, flexDirection: 'column', gap: 2.2, justifyContent: 'center' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  fieldLabel: { fontSize: 3.8, color: '#374151', width: 34, textDecoration: 'underline' },
  fieldValue: { fontSize: 4.2, color: '#111827', fontWeight: 'bold', flex: 1 },
  fieldValueBlue: { fontSize: 4.2, color: BLUE, fontWeight: 'bold', flex: 1 },

  // Center col — signature
  centerCol: { width: 40, alignItems: 'center', justifyContent: 'center', gap: 2 },
  signatureBox: {
    width: 38,
    height: 30,
    backgroundColor: '#f3f4f6',
    border: '0.8pt solid #d1d5db',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    overflow: 'hidden',
  },
  signatureText: { fontSize: 2.8, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' },

  // Right col — photo + year
  rightCol: { width: 32, alignItems: 'center', gap: 3, flexShrink: 0 },
  photo: {
    width: 28,
    height: 36,
    border: `1pt solid ${BLUE}`,
    borderRadius: 1.5,
    backgroundColor: '#e8edf2',
    overflow: 'hidden',
  },
  yearLabel: { fontSize: 3, color: '#6b7280', textAlign: 'center' },
  yearValue: { fontSize: 4, fontWeight: 'bold', color: BLUE, textAlign: 'center' },

  // Footer
  footer: {
    backgroundColor: '#f8fafc',
    borderTop: '0.5pt solid #e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2pt 5pt',
  },
  footerText: { fontSize: 3, color: '#64748b' },
  footerBold: { fontSize: 3, fontWeight: 'bold', color: '#374151' },
  footerBlue: { fontSize: 3, fontWeight: 'bold', color: BLUE },
  divider: { width: 0.5, height: 6, backgroundColor: '#d1d5db' },
})

function InfoRow({ label, value, blue }: { label: string; value: string; blue?: boolean }) {
  return (
    <PdfView style={S.fieldRow}>
      <PdfText style={S.fieldLabel}>{label}</PdfText>
      <PdfText style={blue ? S.fieldValueBlue : S.fieldValue}>{value || '-'}</PdfText>
    </PdfView>
  )
}

function PdfCard({ student, school }: { student: Student; school: School }) {
  return (
    <PdfView style={S.card}>

      {/* HEADER */}
      <PdfView style={S.header}>
        <PdfView style={S.logoCircle}>
          {school.logoUrl
            ? <PdfImage src={school.logoUrl} style={{ width: 20, height: 20 }} />
            : <PdfText style={S.logoText}>CS</PdfText>
          }
        </PdfView>

        <PdfView style={S.schoolCenter}>
          <PdfText style={S.schoolName}>{school.name}</PdfText>
          {school.adresse ? <PdfText style={S.schoolSub}>{school.adresse}</PdfText> : null}
          {school.telephone ? <PdfText style={S.schoolSub}>Tel : {school.telephone}</PdfText> : null}
          {school.lieu ? <PdfText style={S.schoolSub}>{school.lieu}</PdfText> : null}
        </PdfView>

        {school.flagUrl ? (
          <PdfImage src={school.flagUrl} style={S.flag} />
        ) : (
          <PdfView style={S.flagBenin}>
            <PdfView style={{ flex: 1, backgroundColor: '#008751' }} />
            <PdfView style={{ flex: 1, backgroundColor: '#FCD116' }} />
            <PdfView style={{ flex: 1, backgroundColor: '#E8112D' }} />
          </PdfView>
        )}
      </PdfView>

      {/* TITLE BAND */}
      <PdfView style={S.titleBand}>
        <PdfText style={S.titleText}>CARTE D&apos;IDENTITE SCOLAIRE</PdfText>
      </PdfView>

      {/* BODY */}
      <PdfView style={S.body}>

        {/* Left — fields */}
        <PdfView style={S.leftCol}>
          <InfoRow label="Nom et prenoms" value={`${student.nom} ${student.prenoms}`} />
          <InfoRow label="Ne(e) le" value={student.neLe} />
          <InfoRow label="Nationalite" value={student.nationalite} />
          <InfoRow label="Sexe" value={student.sexe === 'M' ? 'Masculin' : 'Feminin'} />
          <InfoRow label="Classe" value={student.classe} />
          {student.tel ? <InfoRow label="N Tel" value={student.tel} /> : null}
          <InfoRow label="N Matricule" value={student.matricule} blue />
        </PdfView>

        {/* Center — signature */}
        <PdfView style={S.centerCol}>
          <PdfView style={S.signatureBox}>
            {school.signatureUrl
              ? <PdfImage src={school.signatureUrl} style={{ maxWidth: 36, maxHeight: 26 }} />
              : <PdfText style={S.signatureText}>{'Signature\ndu titulaire'}</PdfText>
            }
          </PdfView>
        </PdfView>

        {/* Right — photo + year */}
        <PdfView style={S.rightCol}>
          <PdfView style={S.photo}>
            {student.photoUrl
              ? <PdfImage src={student.photoUrl} style={{ width: 28, height: 36, objectFit: 'cover' }} />
              : null
            }
          </PdfView>
          <PdfView style={{ alignItems: 'center' }}>
            <PdfText style={S.yearLabel}>ANNEE SCOLAIRE</PdfText>
            <PdfText style={S.yearValue}>{school.anneeScolaire}</PdfText>
          </PdfView>
        </PdfView>
      </PdfView>

      {/* FOOTER */}
      <PdfView style={S.footer}>
        <PdfText style={S.footerText}>
          Delivre le : <PdfText style={S.footerBold}>{school.dateCarteLabel}</PdfText>
        </PdfText>
        <PdfView style={S.divider} />
        <PdfText style={S.footerText}>
          Annee scolaire : <PdfText style={S.footerBlue}>{school.anneeScolaire}</PdfText>
        </PdfText>
      </PdfView>
    </PdfView>
  )
}

interface CardifyDocumentProps {
  students: Student[]
  school: School
  qrCodes: Record<string, string>
}

export default function CardifyDocument({ students, school }: CardifyDocumentProps) {
  const pages = chunkArray(students, 3)
  return (
    <PdfDoc title={`Cartes scolaires - ${school.name}`} author="Cardify">
      {pages.map((group, pageIdx) => (
        <PdfPage key={pageIdx} size="A4" orientation="portrait" style={S.page}>
          {group.map((student) => (
            <PdfView key={student.id} style={S.pageRow}>
              <PdfCard student={student} school={school} />
            </PdfView>
          ))}
        </PdfPage>
      ))}
    </PdfDoc>
  )
}
