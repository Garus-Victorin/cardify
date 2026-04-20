import {
  Document as RawDocument,
  Page as RawPage,
  View as RawView,
  Text as RawText,
  Image as RawImg,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Student, School } from '@/types'
import { chunkArray } from '@/lib/utils'

// Wrap every react-pdf primitive to avoid Turbopack HTML casing conflicts
function PdfDoc(p: React.ComponentProps<typeof RawDocument>) { return <RawDocument {...p} /> }
function PdfPage(p: React.ComponentProps<typeof RawPage>) { return <RawPage {...p} /> }
function PdfView(p: React.ComponentProps<typeof RawView>) { return <RawView {...p} /> }
function PdfText(p: React.ComponentProps<typeof RawText>) { return <RawText {...p} /> }
function PdfImg(p: React.ComponentProps<typeof RawImg>) { return <RawImg {...p} /> }

const CARD_W = 210
const CARD_H = 130
const THEME = '#1e3a5f'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    border: `2pt solid ${THEME}`,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: THEME,
    flexDirection: 'row',
    alignItems: 'center',
    padding: '4pt 6pt',
    gap: 5,
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  schoolName: {
    color: '#ffffff',
    fontSize: 5.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    flex: 1,
  },
  anneeScolaire: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 4.5,
  },
  titleBand: {
    backgroundColor: '#2563eb',
    alignItems: 'center',
    padding: '2pt',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    flexDirection: 'row',
    padding: '5pt 6pt',
    gap: 6,
    flex: 1,
  },
  infoCol: { flex: 1, gap: 1.8 },
  infoRow: { flexDirection: 'row', gap: 2 },
  infoLabel: { fontSize: 4, color: '#6b7280', width: 42 },
  infoValue: { fontSize: 4.5, color: '#111827', flex: 1 },
  infoValueBold: { fontSize: 4.5, color: '#111827', fontWeight: 'bold', flex: 1 },
  rightCol: { alignItems: 'center', gap: 3, width: 38 },
  photo: {
    width: 36, height: 44,
    border: `1pt solid ${THEME}`,
    borderRadius: 3,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  signatureBox: {
    width: 36, height: 14,
    backgroundColor: '#f9fafb',
    border: '0.5pt solid #e5e7eb',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureText: { fontSize: 3, color: '#9ca3af', textAlign: 'center' },
  qr: { width: 20, height: 20 },
  footer: {
    backgroundColor: '#f8fafc',
    borderTop: '0.5pt solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '2pt 6pt',
  },
  footerText: { fontSize: 3.5, color: '#6b7280' },
  footerBold: { fontSize: 3.5, color: THEME, fontWeight: 'bold' },
  pageRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
})

function PDFCard({ student, school, qrCode }: { student: Student; school: School; qrCode?: string }) {
  return (
    <PdfView style={styles.card}>
      <PdfView style={styles.header}>
        <PdfView style={styles.logoCircle}>
          {school.logoUrl
            ? <PdfImg src={school.logoUrl} style={{ width: 24, height: 24 }} />
            : <PdfText style={{ fontSize: 4, color: '#ffffff', fontWeight: 'bold' }}>CS</PdfText>
          }
        </PdfView>
        <PdfView style={{ flex: 1 }}>
          <PdfText style={styles.schoolName}>{school.name}</PdfText>
          <PdfText style={styles.anneeScolaire}>Annee scolaire {school.anneeScolaire}</PdfText>
        </PdfView>
        {school.flagUrl && <PdfImg src={school.flagUrl} style={{ width: 20, height: 13 }} />}
      </PdfView>

      <PdfView style={styles.titleBand}>
        <PdfText style={styles.titleText}>Carte d&apos;Identite Scolaire</PdfText>
      </PdfView>

      <PdfView style={styles.body}>
        <PdfView style={styles.infoCol}>
          <InfoRow label="Nom et prenoms" value={`${student.nom} ${student.prenoms}`} />
          <InfoRow label="Ne(e) le" value={student.neLe} />
          <InfoRow label="Lieu naiss." value={student.lieuNaissance} />
          <InfoRow label="Nationalite" value={student.nationalite} />
          <InfoRow label="Sexe" value={student.sexe === 'M' ? 'Masculin' : 'Feminin'} />
          <InfoRow label="Classe" value={student.classe} />
          {student.tel && <InfoRow label="N Tel" value={student.tel} />}
          <InfoRow label="N Matricule" value={student.matricule} bold />
        </PdfView>

        <PdfView style={styles.rightCol}>
          <PdfView style={styles.photo}>
            {student.photoUrl && <PdfImg src={student.photoUrl} style={{ width: 36, height: 44, objectFit: 'cover' }} />}
          </PdfView>
          <PdfView style={styles.signatureBox}>
            {school.signatureUrl
              ? <PdfImg src={school.signatureUrl} style={{ maxWidth: 34, maxHeight: 12 }} />
              : <PdfText style={styles.signatureText}>{'Signature\ndu titulaire'}</PdfText>
            }
          </PdfView>
          {qrCode && <PdfImg src={qrCode} style={styles.qr} />}
        </PdfView>
      </PdfView>

      <PdfView style={styles.footer}>
        <PdfText style={styles.footerText}>Delivre le : {school.dateCarteLabel}</PdfText>
        <PdfText style={styles.footerBold}>{school.anneeScolaire}</PdfText>
      </PdfView>
    </PdfView>
  )
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <PdfView style={styles.infoRow}>
      <PdfText style={styles.infoLabel}>{label} :</PdfText>
      <PdfText style={bold ? styles.infoValueBold : styles.infoValue}>{value || '-'}</PdfText>
    </PdfView>
  )
}

interface CardifyDocumentProps {
  students: Student[]
  school: School
  qrCodes: Record<string, string>
}

export default function CardifyDocument({ students, school, qrCodes }: CardifyDocumentProps) {
  const pages = chunkArray(students, 3)
  return (
    <PdfDoc title={`Cartes scolaires - ${school.name}`} author="Cardify">
      {pages.map((group, pageIdx) => (
        <PdfPage key={pageIdx} size="A4" orientation="portrait" style={styles.page}>
          {group.map((student) => (
            <PdfView key={student.id} style={styles.pageRow}>
              <PDFCard student={student} school={school} qrCode={qrCodes[student.id]} />
            </PdfView>
          ))}
        </PdfPage>
      ))}
    </PdfDoc>
  )
}
