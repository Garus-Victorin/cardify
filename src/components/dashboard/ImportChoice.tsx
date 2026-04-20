'use client'
import { useStore } from '@/store'
import { FileSpreadsheet, ClipboardList, ArrowLeft } from 'lucide-react'
import ExcelUploader from './ExcelUploader'
import StudentForm from './StudentForm'

export default function ImportChoice() {
  const { importMode, setImportMode } = useStore()

  if (importMode === 'excel') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setImportMode(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors"
        >
          <ArrowLeft size={14} /> Changer de mode
        </button>
        <ExcelUploader />
      </div>
    )
  }

  if (importMode === 'form') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setImportMode(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1e3a5f] transition-colors"
        >
          <ArrowLeft size={14} /> Changer de mode
        </button>
        <StudentForm />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 text-center mb-6">
        Choisissez comment vous souhaitez ajouter vos eleves
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Excel option */}
        <button
          onClick={() => setImportMode('excel')}
          className="group flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1e3a5f] hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
            <FileSpreadsheet size={32} className="text-green-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-base">Importer un fichier Excel</p>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Importez un fichier .xlsx ou .xls contenant la liste de tous vos eleves en une seule fois
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['Rapide', 'Plusieurs eleves', '.xlsx / .xls'].map((tag) => (
              <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </button>

        {/* Form option */}
        <button
          onClick={() => setImportMode('form')}
          className="group flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1e3a5f] hover:bg-blue-50 transition-all text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
            <ClipboardList size={32} className="text-[#1e3a5f]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-base">Remplir un formulaire</p>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Saisissez les informations de chaque eleve manuellement, un par un, avec tous les champs
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['Manuel', 'Eleve par eleve', 'Avec photo'].map((tag) => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </button>
      </div>
    </div>
  )
}
