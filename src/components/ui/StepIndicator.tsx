'use client'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const STEPS = [
  { label: 'Import',          short: '1' },
  { label: 'Mapping',         short: '2' },
  { label: 'Validation',      short: '3' },
  { label: 'Prévisualisation',short: '4' },
  { label: 'Export PDF',      short: '5' },
]

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex flex-col items-center shrink-0">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.12 : 1,
                  backgroundColor: done ? '#1e3a5f' : active ? '#ffffff' : '#f1f5f9',
                  borderColor: done || active ? '#1e3a5f' : '#e2e8f0',
                }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-shadow',
                  active && 'shadow-md shadow-[#1e3a5f]/20',
                )}
                style={{
                  color: done ? '#fff' : active ? '#1e3a5f' : '#94a3b8',
                }}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </motion.div>

              {/* Label — hidden on xs, visible sm+ */}
              <span className={cn(
                'hidden sm:block text-[10px] sm:text-xs mt-1 whitespace-nowrap font-medium transition-colors',
                active ? 'text-[#1e3a5f]' : done ? 'text-slate-500' : 'text-slate-300'
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 mb-0 sm:mb-4 rounded-full overflow-hidden bg-slate-200">
                <motion.div
                  className="h-full bg-[#1e3a5f] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: i < current ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
