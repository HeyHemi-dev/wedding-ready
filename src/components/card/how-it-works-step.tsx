import { ArrowRight } from 'lucide-react'

interface HowItWorksStepProps {
  step: number
  title: string
  description: string
}

export function HowItWorksStep({ step, title, description }: HowItWorksStepProps) {
  return (
    <div className="flex flex-col gap-sibling">
      <div className="ui-s1 flex aspect-square h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">{step}</div>
      <div className="flex flex-col gap-partner">
        <h3 className="heading-md">{title}</h3>
        <p className="ui text-pretty text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function HowItWorksArrow() {
  return (
    <div className="text-muted-foreground">
      <ArrowRight className="h-6 w-6" />
    </div>
  )
}
