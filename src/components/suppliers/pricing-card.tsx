import { Check } from 'lucide-react'

import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'

interface PricingCardProps {
  name: string
  price: string
  description?: string
  features: string[]
  ctaText: string
  ctaHref: string
  featured?: boolean
  index?: number
}

export function PricingCard({ name, price, description, features, ctaText, ctaHref, featured = false }: PricingCardProps) {
  return (
    <div className={cn('relative', featured && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
      <Area className="h-full">
        <div className="flex flex-col gap-friend">
          <div className="flex flex-col gap-sibling">
            <div className="flex items-baseline gap-spouse">
              <h3 className="heading-lg">{name}</h3>
              {featured && <span className="ui-small-s2 px-partner py-spouse rounded-full bg-primary text-primary-foreground">Popular</span>}
            </div>
            <div className="flex items-baseline gap-spouse">
              <span className="heading-2xl">{price}</span>
              {name !== 'Free' && <span className="text-muted-foreground">/month</span>}
            </div>
            {description && <p className="text-pretty text-muted-foreground">{description}</p>}
          </div>

          <div className="flex flex-col gap-sibling">
            <ul className="flex flex-col gap-spouse">
              {features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-spouse">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-friend mt-auto">
            <Button size="lg" className="w-full" asChild>
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>
        </div>
      </Area>
    </div>
  )
}
