import React from 'react'
import * as PDF from '@react-pdf/renderer'
import type { Student, School } from '@/types'
import { chunkArray } from '@/lib/utils'

const { Document, Page, View, Text, Image, StyleSheet } = PDF

// A4 : 595 x 842 pt
// Marges : 20pt chaque côté → usable width = 555pt
// 2 cartes par ligne + gap 12pt → chaque carte = (555 - 12) / 2 = 271.5pt
// 4 lignes + 3 gaps de 10pt → hauteur max par carte = (842 - 40 - 30) / 4 - 7.5 ≈ 185pt

const PAGE_PAD   = 20
const COL_GAP    = 12
const ROW_GAP    = 10
const USABLE_W   = 595 - PAGE_PAD * 2          // 555
const CARD_W     = (USABLE_W - COL_GAP) / 2    // 271.5
const CARD_H     = 185

const S = StyleSheet.create({
  page: {
    padding: PAGE_PAD,
    backgroundColor: '#f5f7fa',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageLabel: { fontSize: 8, color: '#888', fontWeight: 'bold' },
  separator:  { flex: 1, height: 0.5, backgroundColor: '#d1d5db', marginHorizontal: 6 },
  pageCount:  { fontSize: 7, color: '#aaa' },

  // Grille : 4 rows × 2 cols
  row: {
    flexDirection: 'row',
    gap: COL_GAP,
    marginBottom: ROW_GAP,
  },

  // Carte
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#ffffff',
    border: '0.5pt solid #dddddd',
    padding: '5pt 7pt 6pt',
    flexDirection: 'column',
  },

  // Header carte
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 3,
  },
  logoBox: {
    width: 32, height: 32, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  schoolCenter: { flex: 1, alignItems: 'center' },
  schoolName:   { fontSize: 6.5, fontWeight: 'bold', color: '#111', textAlign: 'center' },
  schoolSub:    { fontSize: 5.5, color: '#444', textAlign: 'center', marginTop: 1 },
  flagBox:      { width: 32, height: 32, flexShrink: 0, overflow: 'hidden' },
  flagRow:      { width: 32, height: 32, flexDirection: 'row', border: '0.5pt solid #d1d5db', overflow: 'hidden' },

  // Titre
  titleBand: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3pt 6pt',
    marginBottom: 4,
  },
  titleText: { color: '#ffffff', fontSize: 8.5, fontWeight: 'bold', letterSpacing: 0.3 },

  // Corps
  body: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
  },
  leftCol: { flex: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3, marginBottom: 3.5 },
  fieldLabel: { fontSize: 5.5, color: '#333', textDecoration: 'underline', width: 42, flexShrink: 0 },
  fieldValue: { fontSize: 6.5, color: '#111', fontWeight: 'bold', flex: 1 },

  centerCol: { width: 46, alignItems: 'center', justifyContent: 'center' },
  signatureBox: {
    width: 46, height: 34,
    border: '0.5pt dashed #bbb',
    alignItems: 'center', justifyContent: 'flex-end',
    padding: '2pt', overflow: 'hidden',
  },
  signatureText: { fontSize: 4.5, color: '#444', fontStyle: 'italic', textDecoration: 'underline', textAlign: 'center' },

  rightCol: { width: 46, alignItems: 'center', justifyContent: 'flex-start', gap: 3 },
  dateLabel: { fontSize: 5, color: '#111', textAlign: 'center' },
  photo: {
    width: 46, height: 56,
    backgroundColor: '#dddddd',
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  yearLabel: { fontSize: 4.5, color: '#111', textAlign: 'center' },
  yearValue: { fontSize: 6.5, fontWeight: 'bold', color: '#111', textAlign: 'center' },

  // Cellule vide (placeholder pour compléter la dernière ligne)
  emptyCard: { width: CARD_W, height: CARD_H },
})

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={S.fieldRow}>
      <Text style={S.fieldLabel}>{label} :</Text>
      <Text style={S.fieldValue}>{value || '-'}</Text>
    </View>
  )
}

function Card({ student, school }: { student: Student; school: School }) {
  const color = school.themeColor || '#1e3a5f'
  return (
    <View style={S.card}>
      {/* Header */}
      <View style={S.cardHeader}>
        <View style={S.logoBox}>
          {school.logoUrl
            ? <Image src={school.logoUrl} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            : <Text style={{ fontSize: 5, color: '#9ca3af', fontWeight: 'bold' }}>LOGO</Text>
          }
        </View>
        <View style={S.schoolCenter}>
          <Text style={S.schoolName}>{school.name}</Text>
          {school.adresse
            ? <Text style={S.schoolSub}>{school.adresse}{school.telephone ? ` — Tél : ${school.telephone}` : ''}</Text>
            : null
          }
          {school.lieu ? <Text style={S.schoolSub}>{school.lieu}</Text> : null}
        </View>
        <View style={S.flagBox}>
          {school.flagUrl
            ? <Image src={school.flagUrl} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            : (
              <View style={S.flagRow}>
                <View style={{ flex: 1, backgroundColor: '#008751' }} />
                <View style={{ flex: 1, backgroundColor: '#FCD116' }} />
                <View style={{ flex: 1, backgroundColor: '#E8112D' }} />
              </View>
            )
          }
        </View>
      </View>

      {/* Titre */}
      <View style={[S.titleBand, { backgroundColor: color }]}>
        <Text style={S.titleText}>CARTE D'IDENTITE SCOLAIRE</Text>
      </View>

      {/* Corps */}
      <View style={S.body}>
        <View style={S.leftCol}>
          <InfoRow label="Nom et prénoms" value={`${student.nom} ${student.prenoms}`} />
          <InfoRow label="Né(e) le"       value={student.neLe + (student.lieuNaissance ? ` à ${student.lieuNaissance}` : '')} />
          <InfoRow label="Nationalité"    value={student.nationalite || '-'} />
          <InfoRow label="Sexe"           value={student.sexe === 'M' ? 'Masculin' : student.sexe === 'F' ? 'Féminin' : '-'} />
          <InfoRow label="Classe"         value={student.classe || '-'} />
          {student.tel ? <InfoRow label="N° Tél" value={student.tel} /> : null}
          <InfoRow label="N° Matricule"   value={student.matricule} />
        </View>

        <View style={S.centerCol}>
          <View style={school.signatureUrl ? { ...S.signatureBox, border: 'none' } : S.signatureBox}>
            {school.signatureUrl
              ? <Image src={school.signatureUrl} style={{ maxWidth: 42, maxHeight: 30, objectFit: 'cover' }} />
              : <Text style={S.signatureText}>Signature du titulaire</Text>
            }
          </View>
        </View>

        <View style={S.rightCol}>
          <Text style={S.dateLabel}>{school.dateCarteLabel}</Text>
          <View style={S.photo}>
            {student.photoUrl
              ? <Image src={student.photoUrl} style={{ width: 46, height: 56, objectFit: 'cover' }} />
              : null
            }
          </View>
          <Text style={S.yearLabel}>ANNÉE SCOLAIRE</Text>
          <Text style={S.yearValue}>{school.anneeScolaire}</Text>
        </View>
      </View>
    </View>
  )
}

export default function CardifyDocument({ students, school }: { students: Student[]; school: School }) {
  const pages = chunkArray(students, 8)

  return (
    <Document title={`Cartes scolaires — ${school.name}`} author="Cardify">
      {pages.map((group, pageIdx) => {
        const rows = chunkArray(group, 2)
        // Compléter la dernière ligne si impaire
        if (rows[rows.length - 1].length === 1) rows[rows.length - 1].push(null as unknown as Student)

        return (
          <Page key={pageIdx} size="A4" style={S.page}>
            {/* En-tête de page */}
            <View style={S.pageHeader}>
              <Text style={S.pageLabel}>Page {pageIdx + 1}</Text>
              <View style={S.separator} />
              <Text style={S.pageCount}>{group.length} carte(s)</Text>
            </View>

            {/* Grille 2×4 */}
            {rows.map((row, rowIdx) => (
              <View key={rowIdx} style={S.row}>
                {row.map((student, colIdx) =>
                  student
                    ? <Card key={student.id || colIdx} student={student} school={school} />
                    : <View key={`empty-${colIdx}`} style={S.emptyCard} />
                )}
              </View>
            ))}
          </Page>
        )
      })}
    </Document>
  )
}
