import { redirect } from 'next/navigation'

import UpdateProfileForm from './update-profile-form'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'

export default async function AccountPage() {
  const authUserId = await getAuthUserId()

  if (!authUserId) {
    redirect('/sign-in')
  }

  const user = await userOperations.getById(authUserId)

  return (
    <div className="grid gap-friend">
      <h1 className="heading-lg">Update your personal profile</h1>
      <UpdateProfileForm
        defaultValues={{
          id: user.id,
          displayName: user.displayName,
          bio: user.bio ?? '',
          avatarUrl: user.avatarUrl ?? '',
          instagramUrl: user.instagramUrl ?? '',
          tiktokUrl: user.tiktokUrl ?? '',
          websiteUrl: user.websiteUrl ?? '',
        }}
        className="max-w-lg"
      />
      <pre className="whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
