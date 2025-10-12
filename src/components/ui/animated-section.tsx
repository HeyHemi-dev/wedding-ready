'use client'

import { motion, type Variants } from 'motion/react'
import { type ReactNode } from 'react'

interface FadeInDivProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  id?: string
}

const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function FadeInDiv({ children, className, delay = 0, stagger = 0, id }: FadeInDivProps) {
  return (
    <motion.div
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      variants={fadeInUpVariants}
      transition={{
        duration: 0.8,
        delay,
        staggerChildren: stagger,
      }}
      viewport={{ once: true, margin: '-100px' }}>
      {children}
    </motion.div>
  )
}
