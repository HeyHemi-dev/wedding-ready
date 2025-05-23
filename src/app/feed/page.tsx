import { Section } from '@/components/ui/section'
import { db } from '@/db/connection'
import * as schema from '@/db/schema'

export default async function Page() {
  const tiles = await db.select().from(schema.tiles)

  return (
    <Section>
      <pre>
        {tiles.map((tile) => (
          <div key={tile.id}>{tile.title}</div>
        ))}
      </pre>
    </Section>
  )
}
