'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { parseExcelHeaders } from '@/lib/excel'
import { useStore } from '@/store'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function ExcelUploader() {
  const { setRawHeaders, setActiveStep } = useStore()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setError('')
    setLoading(true)
    try {
      const { headers, rows: r } = await parseExcelHeaders(f)
      setFile(f)
      setRows(r)
      setRawHeaders(headers)
      sessionStorage.setItem('cardify_rows', JSON.stringify(r))
    } catch {
      setError('Fichier invalide. Veuillez importer un fichier Excel (.xlsx, .xls).')
    } finally {
      setLoading(false)
    }
  }, [setRawHeaders])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  })

  const dropClass = cn(
    'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
    isDragActive ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-300 hover:border-[#1e3a5f] hover:bg-gray-50'
  )

  return (
    <div className="space-y-6">
      <div {...getRootProps()} className={dropClass}>
        <input {...getInputProps()} />
        <FileSpreadsheet className="mx-auto mb-4 text-[#1e3a5f]" size={48} />
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? 'Deposez le fichier ici...' : 'Glissez votre fichier Excel ici'}
        </p>
        <p className="text-sm text-gray-400 mt-1">ou cliquez pour selectionner (.xlsx, .xls)</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <X size={16} /> {error}
        </div>
      )}

      {file && rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <FileSpreadsheet className="text-green-600" size={20} />
            <div>
              <p className="font-medium text-green-800">{file.name}</p>
              <p className="text-sm text-green-600">{rows.length} lignes detectees</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(rows[0]).map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <p className="text-xs text-gray-400 text-center py-2">
                ... et {rows.length - 5} autres lignes
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button loading={loading} onClick={() => setActiveStep(1)}>
              <Upload size={16} /> Continuer vers le mapping
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
