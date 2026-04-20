'use client'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEPS = [
  { label: 'Import' },
  { label: 'Mapping' },
  { label: 'Validation' },
  { label: 'Previsualisation' },
  { label: 'Export PDF' },
]

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                  done && 'bg-[#1e3a5f] border-[#1e3a5f] text-white',
                  active && 'bg-white border-[#1e3a5f] text-[#1e3a5f]',
                  !done && !active && 'bg-white border-gray-300 text-gray-400'
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-xs mt-1 whitespace-nowrap', active ? 'text-[#1e3a5f] font-medium' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 mb-4', i < current ? 'bg-[#1e3a5f]' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
