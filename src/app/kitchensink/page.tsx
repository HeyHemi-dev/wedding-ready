import { SupplierSearchCombobox } from '@/components/tiles/supplier-search-combobox'
import { TileCreditForm } from '@/components/tiles/tile-credit-form'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'

export default function KitchensinkPage() {
  return (
    <Section>
      <Area className="grid gap-friend">
        <h1>Kitchensink</h1>
        <TileCreditForm tileId="123" />
      </Area>
    </Section>
  )
}
