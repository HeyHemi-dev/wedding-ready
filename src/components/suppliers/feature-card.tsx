interface FeatureCardProps {
  title: string
  description: string
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-area border border-area p-6">
      <div className="flex flex-col gap-spouse">
        <h3 className="ui-large">{title}</h3>
        <p className="ui text-pretty text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
