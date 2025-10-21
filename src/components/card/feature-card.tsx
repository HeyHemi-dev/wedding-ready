import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  Icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ Icon, title, description }: FeatureCardProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-partner gap-y-spouse rounded-area border border-area p-6 transition-all duration-200 hover:border-primary hover:bg-primary/20">
      <Icon className="h-6 w-6 self-center text-muted-foreground" />
      <h3 className="ui-large col-start-2">{title}</h3>
      <p className="ui col-start-2 text-pretty text-muted-foreground">{description}</p>
    </div>
  )
}
