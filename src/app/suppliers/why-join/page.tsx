import { ArrowRight, Users, Eye, Star, Clock, Network, Zap, Check, X } from 'lucide-react'
import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { FadeInDiv } from '@/components/ui/animated-section'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { FeatureCard } from '@/components/suppliers/feature-card'
import { FAQItem } from '@/components/suppliers/faq-item'

import { HowItWorksArrow, HowItWorksStep } from '@/components/suppliers/how-it-works-step'
import { PricingTable, FeatureBoolean, FeatureTextWithSubtext } from '@/components/ui/pricing-table'
import { Testimonial } from '@/components/testimonial/testimonial'
import { Logos } from '@/components/testimonial/logos'
import { Badge } from '@/components/ui/badge'

const benefits = [
  {
    title: 'Reach couples early',
    description: "Be seen while they're still dreaming, not price‑shopping.",
    icon: Eye,
  },
  {
    title: 'Local by design',
    description: 'Inspiration is tied to the real New Zealand team who created it.',
    icon: Users,
  },
  {
    title: 'Evergreen exposure',
    description: 'Tiles keep working for you over time.',
    icon: Clock,
  },
  {
    title: 'Celebrate the community',
    description: 'Credits lift you and your collaborators together.',
    icon: Zap,
  },
]

export default function WhyJoinPage() {
  return (
    <Section className="pt-0">
      {/* Hero Section */}
      <Area className="grid place-content-center gap-acquaintance bg-transparent laptop:col-span-full">
        <div className="flex flex-col gap-sibling text-center">
          <h1 className="heading-2xl text-balance">Show your work where couples are already dreaming</h1>
          <p className="ui-large mx-auto max-w-2xl text-balance text-muted-foreground">
            Every Tile credits your business, so "I&nbsp;love&nbsp;this" becomes "Let's&nbsp;book&nbsp;them."
          </p>
        </div>

        <div className="flex flex-col justify-center gap-sibling tablet:flex-row">
          <Button size="lg" asChild>
            <Link href="/suppliers/join" className="flex items-center gap-spouse">
              <span>Join as a supplier</span>
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="#how-it-works">
              <span>Why join WeddingReady</span>
            </Link>
          </Button>
        </div>
        <ul className="flex list-none flex-col gap-sibling text-center">
          <li>
            <p>Join the platform where New Zealand couples turn moodboards into action</p>
          </li>
          <li>
            <p>Be credited, and credit others, to grow a collaborative community</p>
          </li>
          <li>
            <p>Free to start. No card required</p>
          </li>
        </ul>
      </Area>

      {/* How It Works Section */}
      <FadeInDiv id="how-it-works" stagger={0.1}>
        <Area className="grid justify-items-center gap-acquaintance">
          <div className="grid max-w-2xl gap-partner text-center">
            <h2 className="heading-xl">How it works</h2>
            <p className="ui-large text-balance text-muted-foreground">Three simple steps to get your work in front of couples who are ready to book</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-area laptop:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <HowItWorksStep
              step={1}
              title="Upload a tile"
              description="Show your best work in context. Upload up to 10 images at a time using photos you already have."
            />
            <HowItWorksArrow />
            <HowItWorksStep
              step={2}
              title="Credit collaborators"
              description="Tag other suppliers so everyone gets visibility. Request to be credited when you're missed."
            />
            <HowItWorksArrow />
            <HowItWorksStep
              step={3}
              title="Get enquiries"
              description="Credits link straight to your profile. The next click is a message from a couple ready to book."
            />
          </div>
        </Area>
      </FadeInDiv>

      {/* Benefits Section */}
      <FadeInDiv stagger={0.1}>
        <Area className="grid justify-items-center bg-transparent">
          <div className="grid max-w-2xl gap-partner text-center">
            <h2 className="heading-xl">Why suppliers choose WeddingReady</h2>
            <p className="ui-large text-balance text-muted-foreground">Join the platform made specifically for the New Zealand wedding industry</p>
          </div>
        </Area>
        <div className="grid grid-cols-1 gap-friend tablet:grid-cols-2">
          {benefits.map((benefit) => (
            <FeatureCard key={benefit.title} title={benefit.title} description={benefit.description} />
          ))}
        </div>
      </FadeInDiv>

      {/* Spotlight Feature Section */}
      <FadeInDiv stagger={0.1}>
        <Area className="grid gap-acquaintance laptop:grid-cols-2">
          <div className="flex flex-col gap-friend">
            <div className="grid gap-sibling">
              <h2 className="grid justify-items-start gap-partner">
                <Badge className="ui-small-s1"> Feature spotlight</Badge>
                <span className="heading-xl">Supplier crediting</span>
              </h2>
              <p className="ui-large text-muted-foreground">Fair, networked, and built to promote you</p>
            </div>
            <ul className="ml-6 flex list-disc flex-col gap-sibling marker:text-muted-foreground">
              {[
                'Every Tile credits the suppliers whose work is featured.',
                "Request to be credited when you're missed, and add context to describe your contribution.",
                "Credited Tiles appear on each contributor's profile, multiplying reach.",
                'Credits link to your supplier profile, turning saved inspiration into enquiries.',
                'Credits help WeddingReady suggest compatible "dream teams" for couples to book.',
              ].map((item, index) => (
                <li key={index}>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid place-content-center rounded border-2 border-dashed border-white p-6">
            <Users className="mb-friend mx-auto h-16 w-16 text-muted-foreground" />
            <p className="ui-small text-muted-foreground">Visual coming soon</p>
          </div>
        </Area>
      </FadeInDiv>

      {/* Pricing Section */}
      <FadeInDiv stagger={0.2}>
        <Area className="grid gap-acquaintance bg-transparent">
          <div className="grid justify-items-center">
            <div className="grid max-w-2xl gap-partner text-center">
              <h2 className="heading-xl">Simple, transparent pricing</h2>
              <p className="ui-large text-balance text-muted-foreground">Start for free, upgrade for more visibility</p>
            </div>
          </div>

          <PricingTable
            plans={[
              {
                name: 'Basic',
                price: 'Free',
                description: 'Perfect for getting started',
                ctaText: 'Join as a supplier',
                ctaHref: '/suppliers/register',
                features: {
                  'Create a supplier profile': <FeatureBoolean value={true} />,
                  'Upload tiles': <p>20 per month</p>,
                  'Credit other suppliers': <FeatureBoolean value={true} />,
                  'Request to be credited': <FeatureBoolean value={true} />,
                  'Featured in Locations directory': <FeatureBoolean value={false} />,
                  'Featured in Services directory': <FeatureBoolean value={false} />,
                },
              },
              {
                name: 'Plus',
                price: '$30',
                description: 'For suppliers ready to maximize their reach',
                ctaText: 'Join as a supplier',
                ctaHref: '/suppliers/register?plan=premium',
                featured: true,
                features: {
                  'Create a supplier profile': <FeatureBoolean value={true} />,
                  'Upload tiles': <p>Unlimited</p>,
                  'Credit other suppliers': <FeatureBoolean value={true} />,
                  'Request to be credited': <FeatureBoolean value={true} />,
                  'Featured in Locations directory': <FeatureTextWithSubtext text="1 Location included" subtext="$10 per additional location" />,
                  'Featured in Services directory': <FeatureTextWithSubtext text="1 Service included" subtext="$10 per additional service" />,
                },
              },
            ]}
          />
        </Area>
      </FadeInDiv>

      {/* Social Proof Section */}
      <FadeInDiv stagger={0.2}>
        <Area className="grid gap-acquaintance bg-transparent">
          <div className="grid justify-items-center">
            <div className="grid max-w-2xl gap-partner text-center">
              <h2 className="heading-xl">Join the community</h2>
              <p className="ui-large text-muted-foreground">What other New Zealand suppliers are saying about WeddingReady</p>
            </div>
          </div>

          <Testimonial
            quote="WeddingReady has been a game-changer for our business. It's easy to use and has helped us reach more couples looking for our services."
            author={{
              name: 'Jane Smith',
              role: 'Wedding Planner',
              avatar: { src: 'https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp', alt: 'Jane Smith' },
            }}
          />
          <Logos />
        </Area>
      </FadeInDiv>

      {/* Final CTA Section */}
      <FadeInDiv>
        <Area className="grid justify-items-center gap-friend">
          <div className="grid max-w-2xl gap-partner text-center">
            <h2 className="heading-2xl">Ready to join?</h2>
            <p className="ui-large text-muted-foreground">Be where couples are already dreaming —and ready to book.</p>
          </div>

          <Button size="lg" asChild>
            <Link href="/suppliers/register" className="flex items-center gap-spouse">
              <span>Join as a supplier</span>
              <ArrowRight />
            </Link>
          </Button>

          <div className="prose ui-small grid max-w-2xl gap-partner text-balance text-center text-muted-foreground">
            <p>You keep ownership of your images. By sharing, you allow WeddingReady to display and promote them so couples can discover your work.</p>
            <p>
              <a href="/terms" className="underline">
                View full terms of use
              </a>
            </p>
            <p className="ui-small-s1">Free to start. No card required.</p>
          </div>
        </Area>
      </FadeInDiv>

      {/* FAQ Section */}
      <FadeInDiv stagger={0.1}>
        <Area className="grid gap-acquaintance bg-transparent">
          <div className="grid justify-items-center">
            <div className="grid w-full max-w-2xl gap-partner text-center">
              <h2 className="heading-xl">Frequently asked questions</h2>
              <p className="ui-large text-muted-foreground">Everything you need to know about joining WeddingReady</p>
            </div>
          </div>
          <div className="grid grid-cols-1">
            <FAQItem question={"What if I don't have time for another marketing platform?"} className="border-b border-border p-6">
              <div className="prose ui flex flex-col gap-sibling text-pretty">
                <p>Unlike social media that demands constant updates, your content stays relevant as long as you offer the services and products.</p>
                <p>Upload content in bulk (up to 10 images at a time) and build a lasting digital presence that works for you, not the other way around.</p>
                <p className="rounded border border-primary bg-primary/10 p-4 text-primary-foreground">
                  We're also exploring an Instagram integration to automatically import images and credits.{' '}
                  <a href="https://weddingready.co.nz/contact" className="underline">
                    Register your interest.
                  </a>
                </p>
              </div>
            </FAQItem>
            <FAQItem question={'How is WeddingReady different from Pinterest or Instagram?'} className="border-b border-border p-6">
              <div className="prose ui flex flex-col gap-sibling text-pretty">
                <p>
                  Pinterest and Instagram aren't interested in local; so couples are often frustrated, saving inspiration that they will never be able to book.
                </p>
                <p>WeddingReady ties inspiration to local New Zealand suppliers they can actually hire.</p>
              </div>
            </FAQItem>
          </div>
        </Area>
      </FadeInDiv>
    </Section>
  )
}
