import { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

export const pricingFeatures = [
  'Create a supplier profile',
  'Upload tiles',
  'Credit other suppliers',
  'Request to be credited',
  'Featured in Locations directory',
  'Featured in Services directory',
] as const

export type Feature = (typeof pricingFeatures)[number]

interface PricingPlan {
  name: string
  price: string
  description: string
  ctaText: string
  ctaHref: string
  featured?: boolean
  features: Record<Feature, ReactNode>
}

interface PricingTableProps {
  plans: PricingPlan[]
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid">
      {/* Header Row */}
      <div className="grid auto-rows-max grid-cols-3 gap-sibling">
        <div className="row-span-full grid grid-rows-subgrid"></div>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn('row-span-4 grid grid-rows-subgrid justify-items-center gap-sibling rounded-t-area p-6', plan.featured && 'bg-area')}>
            <div className="flex items-center gap-partner">
              <h3 className="heading-md">{plan.name}</h3>
              {plan.featured && <Badge>Popular</Badge>}
            </div>
            <div className="flex items-baseline gap-partner">
              <p className="heading-2xl">{plan.price}</p>
              {plan.price !== 'Free' && <span className="ui text-muted-foreground">/month</span>}
            </div>
            <p className="ui text-center text-muted-foreground">{plan.description}</p>
            <Button asChild>
              <Link href={plan.ctaHref}>{plan.ctaText}</Link>
            </Button>
          </div>
        ))}
      </div>
      {/* Feature Rows */}
      <PricingTableFeatureRow feature={'Create a supplier profile'} plans={plans} />
      <PricingTableFeatureRow feature={'Upload tiles'} plans={plans} />
      <PricingTableFeatureRow feature={'Credit other suppliers'} plans={plans} />
      <PricingTableFeatureRow feature={'Request to be credited'} plans={plans} />
      <PricingTableFeatureRow feature={'Featured in Locations directory'} plans={plans} />
      <PricingTableFeatureRow feature={'Featured in Services directory'} plans={plans} isLast={true} />
    </div>
  )
}

function PricingTableFeatureRow({ feature, plans, isLast = false }: { feature: Feature; plans: PricingPlan[]; isLast?: boolean }) {
  return (
    <div className="border-borde grid grid-cols-3 gap-sibling border-t">
      <div className={cn('flex items-center p-6', isLast && 'pb-12')}>
        <p className="ui">{feature}</p>
      </div>
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn('ui flex items-center justify-center p-6 text-center', plan.featured && 'bg-area', isLast && 'rounded-b-area pb-12')}>
          {plan.features[feature]}
        </div>
      ))}
    </div>
  )
}

export function FeatureBoolean({ value }: { value: boolean }) {
  return value ? <Check className="h-6 w-6" /> : <X className="h-6 w-6 text-destructive" />
}

export function FeatureTextWithSubtext({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="flex flex-col">
      <p className="ui">{text}</p>
      <p className="ui-small text-muted-foreground">{subtext}</p>
    </div>
  )
}
