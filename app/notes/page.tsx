import Section from '@/components/ui/section'
import { db } from '@/db/db'
import * as schema from '@/db/schema'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { redirect } from 'next/navigation'
export default async function Page() {
  const user = await useCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const notes = await db.select().from(schema.notes)

  return (
    <Section>
      <pre>
        {notes.map((note) => (
          <div key={note.id}>{note.title}</div>
        ))}
      </pre>
    </Section>
  )
}
