import Section from '@/components/ui/section'
import { db } from '@/db/db'
import * as schema from '@/db/schema'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
export default async function Page() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

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
