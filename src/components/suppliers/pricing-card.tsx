import { Check } from 'lucide-react'

import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'
import { Badge } from '@/components/ui/badge'

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  ctaText: string
  ctaHref: string
  featured?: boolean
  index?: number
}

export function PricingCard({ name, price, description, features, ctaText, ctaHref, featured = false }: PricingCardProps) {
  return (
    <Area className={cn('grid gap-acquaintance', featured && 'border-2 border-primary bg-primary/10')}>
      <div className="flex flex-col gap-friend">
        <div className="flex items-center gap-spouse">
          <h3 className="heading-md">{name}</h3>
          {featured && <Badge className="bg-primary text-primary-foreground">Popular</Badge>}
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-spouse">
            <span className="heading-2xl">{price}</span>
            {name !== 'Free' && <span className="text-muted-foreground">/month</span>}
          </div>
          <p className="ui-small text-pretty text-muted-foreground">{description}</p>
        </div>
        <ul className="flex flex-col gap-sibling">
          {features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center gap-partner">
              <Check className="h-4 w-4 text-primary-foreground" />
              <span className="ui">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-friend mt-auto">
        <Button size="lg" className="w-full" asChild>
          <a href={ctaHref}>{ctaText}</a>
        </Button>
      </div>
    </Area>
  )
}
