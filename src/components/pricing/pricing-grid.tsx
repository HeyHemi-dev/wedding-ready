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
  const rowCountHeader = 4
  const rowCountFeature = featureKeys.length
  const columnCount = plans.length + 1

  return (
    <Table cols={columnCount} rows={rowCountHeader + rowCountFeature} className="grid overflow-x-auto">
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
          className={cn('grid grid-rows-subgrid')}
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

      {/* Feature rows */}
      {featureKeys.map((key, rowIndex) => {
        const isLastRow = rowIndex === featureKeys.length - 1

        return <FeatureRow key={key} feature={key} plans={plans} isLastRow={isLastRow} />
      })}
    </Table>
  )
}

function FeatureRow({ feature, plans, isLastRow }: { feature: PlanFeatureKey; plans: Plan[]; isLastRow?: boolean }) {
  return (
    <>
      <TableCell isFrozen className="ui-s1 justify-start text-left">
        {planFeatures[feature]}
      </TableCell>
      {plans.map((plan) => {
        return (
          <TableCell key={`${plan.name}-${feature}`} isFeatured={plan.isFeatured} className={isLastRow ? 'rounded-b-area' : undefined}>
            {renderFeatureCell(plan[feature])}
          </TableCell>
        )
      })}
    </>
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

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  cols: number
  rows: number
}

function Table({ className, cols, rows, children, ...props }: TableProps) {
  return (
    <div
      className={cn('grid overflow-x-auto', className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(20rem, 1fr))`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      {...props}>
      {children}
    </div>
  )
}

interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isFeatured?: boolean
  isFrozen?: boolean
}

function TableCell({ className, isFeatured, isFrozen, children, ...props }: TableCellProps) {
  return (
    <div
      className={cn(
        'ui grid items-center justify-items-center p-6 text-center',
        isFeatured && 'bg-area',
        isFrozen && 'sticky left-0 z-10 bg-background',
        className
      )}
      {...props}>
      {children}
    </div>
  )
}
function TableHeaderCell({ className, children, ...props }: TableCellProps) {
  return (
    <TableCell className={cn('rounded-t-area', className)} {...props}>
      {children}
    </TableCell>
  )
}
