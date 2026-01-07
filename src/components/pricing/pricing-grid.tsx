import Link from 'next/link'
import React from 'react'

import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'

import type { Href } from '@/app/_types/generics'

import { Table, TableHeaderCell, TableCell } from '@/components/pricing/table'

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

export function PricingGrid({ plans }: { plans: Plan[] }) {
  const rowCountHeader = 4
  const rowCountFeature = featureKeys.length
  const columnCount = plans.length + 1

  return (
    <Table
      style={{
        gridTemplateRows: `repeat(${rowCountHeader}, max-content) repeat(${rowCountFeature}, 1fr)`,
        gridTemplateColumns: `repeat(${columnCount}, minmax(20rem, 1fr))`,
      }}
      className="grid overflow-x-auto">
      {/* Header row */}
      <TableHeaderCell
        isFrozen
        style={{
          gridRow: `span ${rowCountHeader} / span ${rowCountHeader}`,
        }}
      />
      {plans.map((plan) => (
        <TableHeaderCell
          key={plan.name}
          className={cn('grid grid-rows-subgrid gap-sibling')}
          isFeatured={plan.isFeatured}
          style={{
            gridRow: `span ${rowCountHeader} / span ${rowCountHeader}`,
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
        </TableHeaderCell>
      ))}

      {featureKeys.map((key, rowIndex) => {
        const isLastRow = rowIndex === featureKeys.length - 1

        return (
          <React.Fragment key={key}>
            {/* Feature row */}
            <TableCell isFrozen className="ui-s1 justify-start text-left">
              {planFeatures[key]}
            </TableCell>
            {plans.map((plan) => {
              return (
                <TableCell key={`${plan.name}-${key}`} isFeatured={plan.isFeatured} className={isLastRow ? 'rounded-b-area' : undefined}>
                  {renderFeatureCell(plan[key])}
                </TableCell>
              )
            })}
          </React.Fragment>
        )
      })}
    </Table>
  )
}

function renderFeatureCell(value: PlanFeatureDetail) {
  if (value === true) return <Check className="h-6 w-6" aria-label="Yes" role="img" />
  if (value === false) return <X className="h-6 w-6 text-destructive" aria-label="No" role="img" />
  return (
    <>
      <div>{value.text}</div>
      {value.subtext && <div className="ui-small text-muted-foreground">{value.subtext}</div>}
    </>
  )
}
