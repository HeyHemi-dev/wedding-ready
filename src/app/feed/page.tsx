import { Section } from '@/components/ui/section'
import { db } from '@/src/db/db'
import * as schema from '@/src/db/schema'

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
