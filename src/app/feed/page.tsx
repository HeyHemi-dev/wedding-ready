import { TileListSkeleton } from '@/components/tiles/tile-list'
import { Section } from '@/components/ui/section'

export default async function Page() {
  return (
    <Section>
      <TileListSkeleton />
    </Section>
  )
}
