import Link from 'next/link'
import React from 'react'

import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'

import type { Href } from '@/app/_types/generics'

type PlanFeatureDetail =
  | boolean
  | {
      text: string
      subtext?: string
    }

const planFeatures = {
  createSupplierProfile: 'Create a supplier profile',
  uploadTileLimit: 'Upload tiles',
  creditSuppliers: 'Credit other suppliers',
  requestCredit: 'Request to be credited',
  locationsFeature: 'Featured in Locations directory',
  servicesFeature: 'Featured in Services directory',
} as const
type PlanFeatureKey = keyof typeof planFeatures
const featureKeys = Object.keys(planFeatures) as PlanFeatureKey[]

type Plan = {
  isFeatured: boolean
  name: string
  price: number
  description: string
  cta: Href
} & Record<PlanFeatureKey, PlanFeatureDetail>

export const plans = [
  {
    isFeatured: false,
    name: 'Basic',
    price: 0,
    description: 'Perfect for getting started',
    cta: {
      label: 'Join as a supplier',
      href: '/suppliers/register',
    },
    createSupplierProfile: true,
    uploadTileLimit: { text: '20 per month' },
    creditSuppliers: true,
    requestCredit: true,
    locationsFeature: false,
    servicesFeature: false,
  },
  {
    isFeatured: true,
    name: 'Plus',
    price: 30,
    description: 'For suppliers ready to maximize their reach',
    cta: {
      label: 'Join as a supplier',
      href: '/suppliers/register?plan=plus',
    },
    createSupplierProfile: true,
    uploadTileLimit: { text: 'Unlimited' },
    creditSuppliers: true,
    requestCredit: true,
    locationsFeature: { text: '1 Location included', subtext: '$10 per additional location' },
    servicesFeature: { text: '1 Service included', subtext: '$10 per additional service' },
  },
] satisfies Plan[]

export function PricingGrid({ plans }: { plans: Plan[] }) {
  const headerRowCount = 4
  const featureRowCount = featureKeys.length

  const frozenColumnWidthPx = 200
  const planColumnMinWidthPx = 200

  const gridTemplateColumns =
    plans.length > 0 ? `${frozenColumnWidthPx}px repeat(${plans.length}, minmax(${planColumnMinWidthPx}px, 1fr))` : `${frozenColumnWidthPx}px`

  const gridTemplateRows = featureRowCount > 0 ? `repeat(${headerRowCount}, auto) repeat(${featureRowCount}, auto)` : `repeat(${headerRowCount}, auto)`

  return (
    <div
      className="grid overflow-x-auto"
      style={{
        gridTemplateColumns,
        gridTemplateRows,
      }}>
      {/* Header row */}
      <div
        className="sticky left-0 z-20 bg-background"
        style={{
          gridRow: `span ${headerRowCount} / span ${headerRowCount}`,
        }}
      />
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn('grid grid-rows-subgrid justify-items-center gap-sibling rounded-t-area p-6', plan.isFeatured && 'bg-area')}
          style={{
            gridRow: `span ${headerRowCount} / span ${headerRowCount}`,
          }}>
          <div className="flex items-center gap-partner">
            <h3 className="heading-md">{plan.name}</h3>
            {plan.isFeatured && <Badge>Popular</Badge>}
          </div>
          <div className="flex items-baseline gap-partner">
            <p className="heading-2xl">${plan.price.toLocaleString()}</p>
            {plan.price !== 0 && <span className="ui text-muted-foreground">/month</span>}
          </div>
          <p className="ui text-center text-muted-foreground">{plan.description}</p>
          <Button asChild>
            <Link href={plan.cta.href}>{plan.cta.label}</Link>
          </Button>
        </div>
      ))}

      {/* Feature rows */}
      {featureKeys.map((key, rowIndex) => {
        const isLastRow = rowIndex === featureKeys.length - 1

        return <FeatureRow key={key} feature={key} plans={plans} isLastRow={isLastRow} />
      })}
    </div>
  )
}

function FeatureRow({ feature, plans, isLastRow }: { feature: PlanFeatureKey; plans: Plan[]; isLastRow?: boolean }) {
  return (
    <>
      <div className="ui-s2 sticky left-0 z-10 bg-background py-4 pr-4">{planFeatures[feature]}</div>
      {plans.map((plan) => {
        return (
          <div key={`${plan.name}-${feature}`} className={cn(plan.isFeatured && 'bg-area', plan.isFeatured && isLastRow && 'rounded-b-area', 'py-4')}>
            {renderFeatureCell(plan[feature])}
          </div>
        )
      })}
    </>
  )
}

function renderFeatureCell(value: PlanFeatureDetail) {
  if (value === true) return <Check className="h-6 w-6" aria-label="Yes" role="img" />
  if (value === false) return <X className="h-6 w-6 text-destructive" aria-label="No" role="img" />
  return (
    <div>
      <div>{value.text}</div>
      {value.subtext && <div className="subtext">{value.subtext}</div>}
    </div>
  )
}

/* 
CSS (for reference)

.grid-container {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(200px, 1fr));
}

.header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}

.freeze-col {
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
}

.featured-column {
  background: var(--featured-bg);
}

.featured-column-start {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.featured-column-end {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.subtext {
  font-size: 0.85em;
  opacity: 0.7;
}
*/
