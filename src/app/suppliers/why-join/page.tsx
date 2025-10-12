import { ArrowRight, Users, Eye, Star, Clock, Network, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { Area } from '@/components/ui/area'
import { FadeInDiv } from '@/components/ui/animated-section'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import { FeatureCard } from '@/components/suppliers/feature-card'
import { FAQItem } from '@/components/suppliers/faq-item'
import { PricingCard } from '@/components/suppliers/pricing-card'
import { HowItWorksArrow, HowItWorksStep } from '@/components/suppliers/how-it-works-step'

const benefits = [
  {
    title: 'Reach couples earlier',
    description: "Be seen while they're still dreaming, not price‑shopping.",
    icon: Eye,
  },
  {
    title: 'Local visibility by design',
    description: 'Inspiration ties to the real NZ team who created it.',
    icon: Users,
  },
  {
    title: 'Premium presentation',
    description: 'Look like a feature, not a directory listing.',
    icon: Star,
  },
  {
    title: 'Real work in context',
    description: 'Your contribution shown inside a full wedding story.',
    icon: Network,
  },
  {
    title: 'Evergreen exposure',
    description: 'Tiles keep working for you over time.',
    icon: Clock,
  },
  {
    title: 'Built for the ecosystem',
    description: 'Credits lift you and your collaborators together.',
    icon: Zap,
  },
]

const faqItems = [
  {
    question: '"I don\'t have time for another platform."',
    answer: (
      <div className="flex flex-col gap-sibling">
        <p>
          Upload content in bulk (up to 10 images at a time) using photos you already have. Unlike social media that demands constant updates, your content
          stays relevant as long as you offer the services shown—helping you build a lasting digital presence that works for you, not the other way around.
        </p>
        <p>We're exploring an Instagram integration to automatically import your images and credits. Click here to register your interest.</p>
      </div>
    ),
  },
  {
    question: '"How is this different from Pinterest or Instagram?"',
    answer: 'They inspire globally with no path to book. WeddingReady ties inspiration to local NZ suppliers you can hire.',
  },
]

export default function JoinAsSupplierPage() {
  return (
    <Section className="pt-0">
      {/* Hero Section */}
      <Area className="grid place-content-center gap-acquaintance bg-transparent laptop:col-span-full laptop:row-span-1">
        <div className="flex flex-col gap-sibling text-center">
          <h1 className="heading-2xl">Show your work where couples are already dreaming</h1>
          <p className="ui-large mx-auto max-w-2xl text-pretty text-muted-foreground">
            Every Tile credits your business, so "I love this" becomes "Let's book them."
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
              <span>Learn how it works</span>
            </Link>
          </Button>
        </div>
        <ul className="mx-auto flex max-w-xl flex-col gap-sibling text-left">
          <li className="flex items-start gap-sibling">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
            <span>Join the platform where NZ couples turn moodboards into action</span>
          </li>
          <li className="flex items-start gap-sibling">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
            <span>Be credited, and credit others, to grow a collaborative community</span>
          </li>
          <li className="flex items-start gap-sibling">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
            <span>Free to start. No card required</span>
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
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-area">
            <HowItWorksStep
              step={1}
              title="Upload a Tile"
              description="Show your best work in context. Upload upto 10 images at a time using photos you already have."
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
        <div className="grid grid-cols-1 gap-sibling tablet:grid-cols-2 laptop:grid-cols-3">
          {benefits.map((benefit) => (
            <FeatureCard key={benefit.title} title={benefit.title} description={benefit.description} />
          ))}
        </div>
      </FadeInDiv>

      {/* Spotlight Feature Section */}
      <FadeInDiv stagger={0.1}>
        <div className="grid items-center gap-area laptop:grid-cols-2">
          <div className="flex flex-col gap-friend">
            <h2 className="heading-xl">Spotlight feature: Supplier crediting</h2>
            <p className="ui-large text-muted-foreground">Fair, networked, and built to promote you</p>
            <ul className="flex flex-col gap-sibling">
              {[
                'Credits on every Tile show who did what across the NZ team',
                "Request to be credited when you're missed, and add context to describe your contribution",
                "Credited Tiles appear on each contributor's profile, multiplying reach",
                'Credits link straight to profiles, turning saved inspiration into enquiries',
                'Crediting data suggests compatible "dream teams" and better matches',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-sibling">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <Users className="mb-friend mx-auto h-16 w-16 text-primary" />
            <p className="text-muted-foreground">Visual coming soon</p>
          </div>
        </div>
      </FadeInDiv>

      {/* Pricing Section */}
      <FadeInDiv stagger={0.2}>
        <div className="mb-acquaintance text-center">
          <h2 className="heading-xl mb-friend">Simple, transparent pricing</h2>
          <p className="ui-large mx-auto max-w-2xl text-muted-foreground">Start free, upgrade when you're ready for more visibility</p>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-area laptop:grid-cols-2">
          <PricingCard
            name="Free"
            price="Free"
            description="Perfect for getting started"
            features={['Create supplier profile', 'Upload Tiles', 'Credit suppliers and request to be credited', 'Basic profile visibility']}
            ctaText="Get started free"
            ctaHref="/suppliers/register"
          />
          <PricingCard
            name="Premium"
            price="$20"
            description="For suppliers ready to maximize their reach"
            features={['Everything in Free', 'Enhanced profile placement in directory', 'Priority support', 'Advanced analytics', 'Featured Tile placement']}
            ctaText="Start premium trial"
            ctaHref="/suppliers/register?plan=premium"
            featured={true}
          />
        </div>
      </FadeInDiv>

      {/* FAQ Section */}
      <FadeInDiv stagger={0.1}>
        <div className="mb-acquaintance text-center">
          <h2 className="heading-xl mb-friend">Frequently asked questions</h2>
          <p className="ui-large mx-auto max-w-2xl text-muted-foreground">Everything you need to know about joining WeddingReady</p>
        </div>
        <div className="mx-auto max-w-3xl">
          {faqItems.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </FadeInDiv>

      {/* Social Proof Section */}
      <FadeInDiv stagger={0.2}>
        <div className="text-center">
          <h2 className="heading-xl mb-friend">Join the community</h2>
          <p className="ui-large mb-friend mx-auto max-w-2xl text-muted-foreground">
            Early adopters are shaping the platform and securing first-mover visibility
          </p>

          <div className="text-center">
            <Star className="mb-friend mx-auto h-12 w-12 text-primary" />
            <p className="text-muted-foreground">Supplier testimonials and logos coming soon</p>
          </div>
        </div>
      </FadeInDiv>

      {/* Final CTA Section */}
      <FadeInDiv>
        <div className="text-center">
          <h2 className="heading-xl mb-friend">Ready to join?</h2>
          <p className="ui-large mb-acquaintance mx-auto max-w-2xl text-muted-foreground">Be where couples are already dreaming — and ready to book.</p>
          <div className="mx-auto flex max-w-md flex-col gap-friend">
            <Button size="lg" asChild>
              <Link href="/suppliers/register" className="flex items-center gap-spouse">
                <span>Join as a supplier</span>
                <ArrowRight />
              </Link>
            </Button>
            <div className="space-y-sibling text-sm text-muted-foreground">
              <p>You keep ownership of your images. By sharing, you allow WeddingReady to display and promote them so couples can discover your work.</p>
              <p>
                <a href="/terms" className="underline hover:no-underline">
                  View full terms of use
                </a>
              </p>
              <p className="font-medium">Free to start. No card required.</p>
            </div>
          </div>
        </div>
      </FadeInDiv>
    </Section>
  )
}
