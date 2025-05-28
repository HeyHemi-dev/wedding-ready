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
      href: '/find-suppliers',
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
      <Section className="min-h-svh-minus-header pt-0">
        <div className="grid grid-cols-3 gap-area md:grid-rows-4">
          <Area className="col-span-full grid place-content-center gap-acquaintance md:col-span-2 md:row-span-full">
            <div className="flex flex-col gap-sibling md:pr-xxl">
              <h1 className="heading-2xl">Wedding inspiration you can actually book.</h1>
              <p className="ui-large text-pretty">Explore local ideas, save what you love, and connect with real NZ suppliers—all for free.</p>
            </div>
            <div className="flex flex-col gap-sibling sm:flex-row">
              <Button size={'lg'} asChild>
                <Link href="/sign-up" className="flex items-center gap-spouse">
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
          </Area>
          <Area className="relative col-span-1 overflow-hidden md:row-span-3">
            <Image className="object-cover" src="/assets/home-hero.jpg" alt="Couple just married celebrating with confetti" fill sizes="100vw" />
          </Area>
          <Area className="col-span-2 row-span-1 md:col-span-1"></Area>
        </div>
      </Section>

      <StackingCardsContainer cards={cards} />

      <Section>
        <div className="grid gap-area md:grid-cols-3 md:grid-rows-1">
          <Area className="relative min-h-[33svh] overflow-hidden md:col-span-1 md:row-span-full">
            <Image className="object-cover" src="/assets/home-supplier2.jpg" alt="Indian wedding couple exchanging garlands" fill sizes="33vw" />
          </Area>
          <Area className="grid place-content-center gap-friend md:col-span-2 md:row-span-full">
            <div className="flex flex-col gap-sibling pr-xxl">
              <h2 className="heading-lg">Are you a wedding supplier?</h2>
              <p className="text-pretty">
                Reach more couples, showcase your work, and get discovered on WeddingReady. It&apos;s free to join, and only takes a few minutes to set up.
              </p>
            </div>
            <div className="flex flex-col gap-sibling sm:flex-row">
              <Button asChild size="lg">
                <Link href="/suppliers/join" className="flex items-center gap-spouse">
                  <span>Join as a supplier</span>
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant={'ghost'}>
                <Link href="/suppliers/join">Learn more</Link>
              </Button>
            </div>
          </Area>
        </div>
      </Section>
    </>
  )
}
