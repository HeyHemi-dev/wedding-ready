'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import Section from '@/components/ui/section'

import { ArrowRight } from 'lucide-react'
import { motion, MotionValue, useScroll, useTransform } from 'motion/react'

export interface CardContent {
  title: string
  description: string
  cta: {
    text: string
    href: string
  }
}

export function CardsContainer({ cards }: { cards: CardContent[] }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <motion.div className="relative" ref={ref}>
      {cards.map((card, index) => {
        const targetScale = 1 - (cards.length - index) * 0.05
        return <Card key={index} {...card} index={index} range={[0, 1]} targetScale={targetScale} scrollProgress={scrollYProgress} />
      })}
    </motion.div>
  )
}

interface CardProps extends CardContent {
  index: number
  range: [number, number]
  targetScale: number
  scrollProgress: MotionValue<number>
}

function Card({ title, description, cta, index, range, targetScale, scrollProgress }: CardProps) {
  const scale = useTransform(scrollProgress, range, [1, targetScale])

  return (
    <div className="sticky top-0" style={{ paddingTop: index * 24 }}>
      <Section sectionClassName="h-svh">
        <motion.div className="grid place-items-center rounded-3xl bg-secondary p-xxl" style={{ scale, transformOrigin: 'top' }}>
          <div className="flex flex-col items-center gap-md">
            <div className="flex max-w-[60ch] flex-col items-center gap-md text-center">
              <h2 className="text-balance font-serif text-6xl">{title}</h2>
              <p className="text-pretty text-xl">{description}</p>
            </div>
            <div className="flex gap-xs pt-md">
              <Button asChild size="lg">
                <Link href={cta.href} className="flex items-center gap-xs">
                  <span>{cta.text}</span>
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  )
}
