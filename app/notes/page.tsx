import { db } from '@/db/db'
import * as schema from '@/db/schema'

export default async function Page() {
  const notes = await db.select().from(schema.notes)

  return (
    <pre>
      {notes.map((note) => (
        <div key={note.id}>{note.title}</div>
      ))}
    </pre>
  )
}
