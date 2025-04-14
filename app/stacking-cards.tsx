'use client'

import { useRef } from 'react'

import { ArrowRight } from 'lucide-react'
import { motion, MotionValue, useScroll, useTransform } from 'motion/react'
import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

export interface StackingCardContent {
  title: string
  description: string
  cta: {
    text: string
    href: string
  }
}

export function StackingCardsContainer({ cards }: { cards: StackingCardContent[] }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <motion.div className="relative" ref={ref}>
      {cards.map((card, index) => {
        return <StackingCard key={index} {...card} index={index} arrayLength={cards.length} scrollProgress={scrollYProgress} />
      })}
    </motion.div>
  )
}

interface StackingCardProps extends StackingCardContent {
  index: number
  arrayLength: number
  scrollProgress: MotionValue<number>
}

function StackingCard({ title, description, cta, index, arrayLength, scrollProgress }: StackingCardProps) {
  // adjust for each card as we go down the list.
  const scaleFinal = 1 - 0.05 * (arrayLength - index - 1)
  const opacityFinal = 0.3 * (arrayLength - index - 1)

  // start transformations only once the next card is in view.
  const range = [0, index * (1 / arrayLength), 1]

  const scale = useTransform(scrollProgress, range, [1, 1, scaleFinal])
  const opacity = useTransform(scrollProgress, range, [0, 0, opacityFinal])

  return (
    <div className="sticky top-0 h-svh" style={{ paddingTop: index * 24 }}>
      <Section className="h-full">
        <motion.div className="grid" style={{ scale, transformOrigin: 'top' }}>
          <Area className="grid place-items-center">
            <div className="flex flex-col items-center gap-md">
              <div className="flex max-w-[60ch] flex-col items-center gap-md text-center">
                <h2 className="text-balance font-serif text-6xl">{title}</h2>
                <p className="text-pretty text-xl">{description}</p>
              </div>
              <div className="flex gap-xs pt-md">
                <Link href={cta.href} className="flex items-center gap-xs" passHref>
                  <Button size="lg">
                    <span>{cta.text}</span>
                    <ArrowRight />
                  </Button>
                </Link>
              </div>
            </div>
            <motion.div className="pointer-events-none absolute inset-0 bg-background" style={{ opacity }} />
          </Area>
        </motion.div>
      </Section>
    </div>
  )
}
