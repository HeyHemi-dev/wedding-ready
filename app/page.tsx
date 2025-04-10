'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useRef } from 'react'

import { Button } from '@/components/ui/button'
import Section from '@/components/ui/section'

import { ArrowRight } from 'lucide-react'
import { motion, MotionValue, useScroll, useTransform } from 'motion/react'

export default function Home() {
  return (
    <>
      <Section sectionClassName="h-svh-minus-header">
        <div className="grid grid-cols-3 grid-rows-4 gap-md">
          <div className="col-span-2 row-span-full grid place-items-center rounded-3xl bg-secondary p-xxl">
            <div className="flex flex-col gap-md pr-xxl">
              <h1 className="text-balance font-serif text-6xl">Wedding inspiration you can actually book.</h1>
              <p className="text-pretty text-xl">Explore local ideas, save what you love, and connect with real NZ suppliers—all for free.</p>
              <div className="flex gap-xs pt-md">
                <Button size={'lg'} asChild>
                  <Link href="/sign-up" className="flex items-center gap-xs">
                    <span>Sign up now</span>
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant={'ghost'} size={'lg'} asChild>
                  <Link href="/feed">
                    <span className="font-semibold">Start exploring</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="relative col-span-1 row-span-3 overflow-hidden rounded-3xl bg-secondary">
            <Image className="object-cover" src="/assets/home-hero.jpg" alt="Wedding rings" fill sizes="100vw" />
          </div>
          <div className="col-span-1 row-span-1 rounded-3xl bg-primary p-xxl">
            <div className="flex flex-col gap-md"></div>
          </div>
        </div>
      </Section>

      <CardsContainer cards={cards} />

      <Section>
        <div className="grid min-h-[33svh] grid-cols-3 grid-rows-1 gap-md">
          <div className="relative col-span-1 row-span-full overflow-hidden rounded-3xl bg-secondary">
            <div className="col-span-1 row-span-full grid place-items-center rounded-3xl bg-secondary p-xxl">
              <Image className="object-cover" src="/assets/home-hero.jpg" alt="Wedding rings" fill sizes="100vw" />
            </div>
          </div>
          <div className="col-span-2 row-span-full grid place-items-center rounded-3xl bg-secondary p-xxl">
            <div className="flex flex-col gap-md pr-xxl">
              <h2 className="text-balance font-serif text-4xl">Are you a wedding supplier?</h2>
              <p className="text-pretty">
                Reach more couples, showcase your work, and get discovered on WeddingReady. It's free to join, and only takes a few minutes to set up.
              </p>
              <div className="flex gap-xs pt-md">
                <Button asChild size="lg">
                  <Link href="/suppliers/join">Join as a supplier</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

interface CardContent {
  title: string
  description: string
  cta: {
    text: string
    href: string
  }
}
const cards: CardContent[] = [
  {
    title: 'Explore inspiration that fits your wedding.',
    description:
      'From dreamy boho florals to modern table settings, search by style, vibe, or keyword—every result is available from local New&nbsp;Zealand suppliers.',
    cta: {
      text: 'Start exploring',
      href: '/feed',
    },
  },
  {
    title: 'Find your dream team, not just a moodboard.',
    description: 'Every image is tagged with the real suppliers who created it, so turning your inspiration into reality is just a click away.',
    cta: {
      text: 'Search local suppliers',
      href: '/suppliers',
    },
  },
  {
    title: 'Save what you love.',
    description: "Create collections of your favourite tiles. Every saved idea is 100% bookable—no more falling for overseas Pinterest dreams you can't have.",
    cta: {
      text: 'Save your favourites',
      href: '/sign-up',
    },
  },
  {
    title: 'From inspo to "I do."',
    description: 'WeddingReady connects you with real local options to make planning easier, faster, and way more fun.',
    cta: {
      text: 'Sign up now',
      href: '/sign-up',
    },
  },
]

function CardsContainer({ cards }: { cards: CardContent[] }) {
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
