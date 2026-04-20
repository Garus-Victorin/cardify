import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Student, School } from '@/types'
import { chunkArray } from '@/lib/utils'

// Aliases — kept as plain assignments so the JSX below uses PascalCase names
// that React recognises as components, not HTML tags.
const PdfDocument = Document
const PdfPage     = Page
const PdfView     = View
const PdfText     = Text
const PdfImage    = Image
// Card dimensions
const CARD_W = 204
const CARD_H = 122

const S = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: '15pt 20pt',
    flexDirection: 'column',
    gap: 10,
  },
  pageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },

  // ── HEADER (same as preview) ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '2pt 4pt',
    gap: 3,
  },
  logoCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoText: { fontSize: 3.5, fontWeight: 'bold' },
  schoolInfoCol: { flex: 1 },
  schoolName: {
    fontSize: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  schoolSub: { fontSize: 3, color: 'rgba(255,255,255,0.85)' },
  schoolSubLight: { fontSize: 2.8, color: 'rgba(255,255,255,0.75)' },

  // ── TITLE BAND (no blue bg, border bottom) ──
  titleBand: {
    alignItems: 'center',
    padding: '1.2pt 0',
    backgroundColor: '#ffffff',
  },
  titleText: {
    fontSize: 3.6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── BODY ──
  body: {
    flexDirection: 'row',
    padding: '3pt 4pt',
    gap: 4,
    flex: 1,
  },
  infoCol: { flex: 1, gap: 1.3 },
  infoRow: { flexDirection: 'row', gap: 1.5 },
  infoLabel: { fontSize: 2.7, color: '#6b7280', width: 33 },
  infoValue: { fontSize: 3, color: '#111827', flex: 1 },
  infoValueBold: { fontSize: 3, fontWeight: 'bold', flex: 1 },

  // ── RIGHT COL (photo + signature) ──
  rightCol: { alignItems: 'center', gap: 2, width: 30 },
  photo: {
    width: 26,
    height: 35,
    borderRadius: 1.5,
    backgroundColor: '#f0f4f8',
    overflow: 'hidden',
  },
  signatureBox: {
    width: 26,
    height: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureText: { fontSize: 2.4, color: '#9ca3af', textAlign: 'center' },

  // ── FOOTER ──
  footer: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.2pt 4pt',
  },
  footerText: { fontSize: 2.7, color: '#64748b' },
  footerAddr: { fontSize: 2.4, color: '#94a3b8' },
  footerBold: { fontSize: 2.7, fontWeight: 'bold' },
})

function InfoRow({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <PdfView style={S.infoRow}>
      <PdfText style={S.infoLabel}>{label} :</PdfText>
      <PdfText style={[bold ? S.infoValueBold : S.infoValue, color ? { color } : {}]}>
        {value || '-'}
      </PdfText>
    </PdfView>
  )
}

function PdfCard({ student, school }: { student: Student; school: School }) {
  const theme = school.themeColor || '#000080'

  return (
    <PdfView style={[S.card, { border: `1.5pt solid ${theme}` }]}>

      {/* HEADER — same fields as CardPreview */}
      <PdfView style={[S.header, { backgroundColor: theme }]}>
        <PdfView style={[S.logoCircle, { border: `1pt solid rgba(255,255,255,0.5)` }]}>
          {school.logoUrl
            ? <PdfImage src={school.logoUrl} style={{ width: 13, height: 13 }} />
            : <PdfText style={[S.logoText, { color: theme }]}>CS</PdfText>
          }
        </PdfView>

        <PdfView style={S.schoolInfoCol}>
          <PdfText style={S.schoolName}>{school.name}</PdfText>
          {school.lieu
            ? <PdfText style={S.schoolSub}>{school.lieu}</PdfText>
            : null
          }
          {school.telephone
            ? <PdfText style={S.schoolSubLight}>Tel : {school.telephone}</PdfText>
            : null
          }
          <PdfText style={S.schoolSubLight}>Ann. scol. {school.anneeScolaire}</PdfText>
        </PdfView>

        {school.flagUrl
          ? <PdfImage src={school.flagUrl} style={{ width: 12, height: 8 }} />
          : null
        }
      </PdfView>

      {/* TITLE — no blue background, theme color text + bottom border */}
      <PdfView style={[S.titleBand, { borderBottom: `0.8pt solid ${theme}` }]}>
        <PdfText style={[S.titleText, { color: theme }]}>
          Carte d&apos;Identite Scolaire
        </PdfText>
      </PdfView>

      {/* BODY */}
      <PdfView style={S.body}>
        <PdfView style={S.infoCol}>
          <InfoRow label="Nom et Prenoms"     value={`${student.nom} ${student.prenoms}`} />
          <InfoRow label="Ne(e) le"           value={student.neLe} />
          <InfoRow label="Lieu de naissance"  value={student.lieuNaissance} />
          <InfoRow label="Nationalite"        value={student.nationalite} />
          <InfoRow label="Sexe"               value={student.sexe === 'M' ? 'Masculin' : 'Feminin'} />
          <InfoRow label="Classe"             value={student.classe} />
          {student.tel
            ? <InfoRow label="N Tel" value={student.tel} />
            : null
          }
          <InfoRow label="N Matricule" value={student.matricule} bold color={theme} />
        </PdfView>

        <PdfView style={S.rightCol}>
          {/* Photo */}
          <PdfView style={[S.photo, { border: `1pt solid ${theme}` }]}>
            {student.photoUrl
              ? <PdfImage src={student.photoUrl} style={{ width: 26, height: 35, objectFit: 'cover' }} />
              : null
            }
          </PdfView>

          {/* Signature */}
          <PdfView style={[S.signatureBox, { border: `0.5pt solid #d1d5db` }]}>
            {school.signatureUrl
              ? <PdfImage src={school.signatureUrl} style={{ maxWidth: 24, maxHeight: 8 }} />
              : <PdfText style={S.signatureText}>{'Signature\ndu titulaire'}</PdfText>
            }
          </PdfView>
        </PdfView>
      </PdfView>

      {/* FOOTER */}
      <PdfView style={S.footer}>
        <PdfText style={S.footerText}>Delivre le : {school.dateCarteLabel}</PdfText>
        {school.adresse
          ? <PdfText style={S.footerAddr}>{school.adresse}</PdfText>
          : null
        }
        <PdfText style={[S.footerBold, { color: theme }]}>{school.anneeScolaire}</PdfText>
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
    <PdfDocument title={`Cartes scolaires - ${school.name}`} author="Cardify">
      {pages.map((group, pageIdx) => (
        <PdfPage key={pageIdx} size="A4" orientation="portrait" style={S.page}>
          {group.map((student) => (
            <PdfView key={student.id} style={S.pageRow}>
              <PdfCard student={student} school={school} />
            </PdfView>
          ))}
        </PdfPage>
      ))}
    </PdfDocument>
  )
}
