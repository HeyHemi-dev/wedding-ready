import UserDetailActions from '@/models/user-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/actions/get-current-user'
import { InsertUserDetailRaw } from '@/models/types'
import { InfoIcon } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h2 className="font-bold text-2xl">User details</h2>

        <form action={handleUpdateUserDetail} className="flex flex-col gap-4">
          <Input name="handle" placeholder="your handle" defaultValue={user.extended.handle} required />
          <Button type="submit">Update</Button>
          <Input name="userId" type="hidden" value={user.id} />
        </form>
        <pre className="text-xs font-mono p-3 rounded border text-muted-foreground bg-muted">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  )
}

async function handleUpdateUserDetail(formData: FormData) {
  'use server'
  const userId = formData.get('userId')?.toString()
  const handle = formData.get('handle')?.toString()
  const avatarUrl = formData.get('avatarUrl')?.toString()

  console.log('handle', handle)

  const user = await getCurrentUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  if (!handle || !(await UserDetailActions.isHandleAvailable(handle))) {
    throw new Error('Handle is already taken')
  }

  const insertUserDetailRaw: InsertUserDetailRaw = {
    id: user.extended.id,
    handle: handle ?? user.extended.handle,
    avatarUrl: avatarUrl ?? user.extended.avatarUrl,
    updatedAt: new Date(),
  }

  await new UserDetailActions(user.extended).update(insertUserDetailRaw)

  revalidatePath('/account')
}
