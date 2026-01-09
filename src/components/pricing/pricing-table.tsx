import React from 'react'

import { Check, X } from 'lucide-react'
import Link from 'next/link'

import type { Href, Dollar } from '@/app/_types/generics'
import { Table, TableCell, TableRow } from '@/components/pricing/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'

type PlanFeatureDetail =
  | boolean
  | {
      text: string
      subtext?: string
    }

const planFeatures = {
  createSupplierProfile: 'Create a supplier profile',
  uploadTileLimit: 'Max tile uploads',
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
  price: Dollar
  description: string
  cta: Href
} & Record<PlanFeatureKey, PlanFeatureDetail>

export function PricingTable({ plans }: { plans: Plan[] }) {
  const rowCountHeader = 4
  const rowCountFeature = featureKeys.length
  const columnCount = plans.length

  return (
    <Table
      isFirstColFrozen
      style={{
        gridTemplateRows: `max-content repeat(${rowCountFeature}, 1fr)`,
        gridTemplateColumns: `minmax(min-content, 1fr) repeat(${columnCount}, minmax(16rem, 1fr))`,
      }}>
      {/* Header row */}
      <TableRow hasAccentOnHover={false} style={{ gridTemplateRows: `repeat(${rowCountHeader}, min-content)` }} className="gap-y-sibling">
        <TableCell />
        {plans.map((plan) => (
          <TableCell
            key={plan.name}
            className={cn('grid grid-rows-subgrid justify-items-center', plan.isFeatured && 'rounded-t-area pt-area')}
            hasAccent={plan.isFeatured}>
            {renderHeaderCell(plan)}
          </TableCell>
        ))}
      </TableRow>

      {featureKeys.map((key, rowIndex) => {
        const isLastRow = rowIndex === featureKeys.length - 1
        /* Feature row */
        return (
          <TableRow key={key}>
            <TableCell className="ui-s1 content-center justify-start text-left">{planFeatures[key]}</TableCell>
            {plans.map((plan) => {
              return (
                <TableCell key={`${plan.name}-${key}`} hasAccent={plan.isFeatured} className={cn('place-content-center', isLastRow && 'rounded-b-area')}>
                  {renderFeatureCell(plan[key])}
                </TableCell>
              )
            })}
          </TableRow>
        )
      })}
    </Table>
  )
}

function renderHeaderCell(plan: Plan) {
  return (
    <>
      <div className="flex items-center gap-partner self-end">
        <h3 className="heading-md">{plan.name}</h3>
        {plan.isFeatured && <Badge>Popular</Badge>}
      </div>
      <div className="flex items-baseline gap-partner">
        <p className="heading-2xl">{plan.price === 0 ? 'Free' : `$${plan.price.toLocaleString()}`}</p>
        {plan.price !== 0 && <span className="ui text-muted-foreground">/month</span>}
      </div>
      <p className="ui text-center text-muted-foreground">{plan.description}</p>
      <Button asChild>
        <Link href={plan.cta.href}>{plan.cta.label}</Link>
      </Button>
    </>
  )
}

function renderFeatureCell(value: PlanFeatureDetail) {
  if (value === true) return <Check className="h-6 w-6" aria-label="Yes" role="img" />
  if (value === false) return <X className="h-6 w-6 text-destructive" aria-label="No" role="img" />
  return (
    <>
      <div className="ui">{value.text}</div>
      {value.subtext && <div className="ui-small text-muted-foreground">{value.subtext}</div>}
    </>
  )
}
