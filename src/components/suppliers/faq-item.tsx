'use client'

import { useState } from 'react'

import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/utils/shadcn-utils'

interface FAQItemProps {
  question: string
  answer: string | React.ReactNode
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button onClick={() => setIsOpen(!isOpen)} className="py-friend flex w-full items-center justify-between gap-sibling text-left">
        <span className="heading-sm">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="pb-friend text-muted-foreground">{typeof answer === 'string' ? <p className="text-pretty">{answer}</p> : answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
