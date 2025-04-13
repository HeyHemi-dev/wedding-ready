import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { StackingCardsContainer, StackingCardContent } from './stacking-cards'

const cards: StackingCardContent[] = [
  {
    title: 'Explore inspiration that fits your wedding.',
    description: 'From dreamy boho florals to modern table settings, search by style, vibe, or keyword—every result is available from local NZ suppliers.',
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

export default function Home() {
  return (
    <>
      <Section className="h-svh-minus-header pt-md">
        <div className="grid grid-cols-3 grid-rows-4 gap-md">
          <Area className="col-span-2 row-span-full grid place-items-center">
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
          </Area>
          <Area className="relative col-span-1 row-span-3 overflow-hidden">
            <Image className="object-cover" src="/assets/home-hero.jpg" alt="Couple just married celebrating with confetti" fill sizes="100vw" />
          </Area>
          <Area className="col-span-1 row-span-1 bg-primary">
            <div className="flex flex-col gap-md"></div>
          </Area>
        </div>
      </Section>

      <StackingCardsContainer cards={cards} />

      <Section>
        <div className="grid min-h-[33svh] grid-cols-3 grid-rows-1 gap-md">
          <Area className="relative col-span-1 row-span-full overflow-hidden">
            <Image className="object-cover" src="/assets/home-supplier2.jpg" alt="Indian wedding couple exchanging garlands" fill sizes="33vw" />
          </Area>
          <Area className="col-span-2 row-span-full grid place-items-center">
            <div className="flex flex-col gap-md pr-xxl">
              <h2 className="text-balance font-serif text-4xl">Are you a wedding supplier?</h2>
              <p className="text-pretty">
                Reach more couples, showcase your work, and get discovered on WeddingReady. It&apos;s free to join, and only takes a few minutes to set up.
              </p>
              <div className="flex gap-xs pt-md">
                <Button asChild size="lg">
                  <Link href="/suppliers/join" className="flex items-center gap-xs">
                    <span>Join as a supplier</span>
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant={'ghost'}>
                  <Link href="/suppliers/join">Learn more</Link>
                </Button>
              </div>
            </div>
          </Area>
        </div>
      </Section>
    </>
  )
}
