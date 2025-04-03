import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'

import HeroTextCarousel from './hero-text-carousel'

export default function Home() {
  return (
    <>
      {/* Section 1 - Hero */}
      <HeroSection />

      {/* Section 2 - Search */}
      <HomePageSection
        image={{ url: '/images/search.jpg', alt: 'Search', side: 'left' }}
        bgClass="bg-gradient-to-br from-red-200 to-red-100"
        text={{
          title: 'Find ideas that fit your wedding.',
          description: 'Looking for something unique? Search for styles, themes, or local vendors—like "boho wedding florals"—and see what\'s possible in NZ.',
          colorClass: 'text-red-900',
        }}
        cta={{ text: 'Explore', link: '/search' }}
      />

      {/* Section 3 - Save */}
      <HomePageSection
        image={{
          url: '/images/save.jpg',
          alt: 'Save Inspiration',
          side: 'right',
        }}
        bgClass="bg-gradient-to-br from-amber-100 to-amber-50"
        text={{
          title: 'Save inspiration.',
          description: 'Gather your favorite ideas, knowing every option is available through local vendors.',
          colorClass: 'text-amber-900',
        }}
        cta={{ text: 'Explore', link: '/search' }}
      />

      {/* Section 4 - Bring to Life */}
      <HomePageSection
        image={{
          url: '/images/bring-to-life.jpg',
          alt: 'Bring to Life',
          side: 'left',
        }}
        bgClass="bg-gradient-to-br from-teal-100 to-teal-50"
        text={{
          title: 'See it, save it, bring it to life.',
          description: 'The best part of WeddingReady is discovering real options from real vendors, making planning easier and more exciting.',
          colorClass: 'text-teal-900',
        }}
        cta={{ text: 'Explore', link: '/search' }}
      />
    </>
  )
}

function HomePageSection({
  image,
  bgClass,
  text,
  cta,
}: {
  image: { url: string; alt: string; side: 'left' | 'right' }
  bgClass: string
  text: { title: string; description: string; colorClass: string }
  cta: { text: string; link: string }
}) {
  return (
    <section className="grid min-h-svh grid-cols-2">
      <div className={cn('row-start-1 grid place-content-center p-16', bgClass, image.side === 'left' ? 'col-start-2' : 'col-start-1')}>
        <div className="flex max-w-lg flex-col gap-8">
          <div className="space-y-4">
            <h2 className={cn('text-6xl font-bold', text.colorClass)}>{text.title}</h2>
            <p className={cn('text-lg', text.colorClass)}>{text.description}</p>
          </div>
          <Link href={cta.link}>
            <Button size="lg" variant={'secondary'}>
              {cta.text}
            </Button>
          </Link>
        </div>
      </div>
      <div className={cn('relative row-start-1 grid bg-muted', image.side === 'left' ? 'col-start-1' : 'col-start-2')}>
        <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
    </section>
  )
}

function HeroSection() {
  return (
    <section className="grid h-svh-minus-header grid-rows-[1fr_auto]">
      <div className="grid place-content-center justify-items-center gap-8">
        <HeroTextCarousel className="space-y-[0.07em] bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-center text-7xl font-extrabold text-transparent" />
        <Link href="/suppliers">
          <Button size={'lg'} className="bg-amber-700 text-white">
            Explore
          </Button>
        </Link>
      </div>
      <p className="hidden">
        WeddingReady transforms your wedding vision into reality with inspiration sourced from real vendors in New Zealand. No more endless searching - just
        beautiful ideas you can actually have.
      </p>
      {/* scroll indicator positioned to bottom center with chevron down */}

      <div className="flex flex-col items-center justify-center bg-orange-100 p-16">
        <p className="text-orange-900">See how it works</p>
        <ChevronDown className="h-8 w-8 text-orange-900" />
      </div>
    </section>
  )
}
