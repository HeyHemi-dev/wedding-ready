import { AddCreditButton } from '@/components/tiles/add-credit-button'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'

export default function KitchensinkPage() {
  return (
    <>
      <Section>
        <Area className="grid gap-friend">
          <h1>Kitchensink</h1>
        </Area>
      </Section>
      <Section>
        <Area className="grid gap-friend">
          <AddCreditButton tileId="123" />
        </Area>
      </Section>
    </>
  )
}
