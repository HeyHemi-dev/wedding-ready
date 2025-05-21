import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import { nullishToEmptyString } from '@/utils/empty-strings'

import UpdateProfileForm from './update-profile-form'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="grid gap-friend">
      <h1 className="heading-lg">Update your personal profile</h1>
      <UpdateProfileForm
        defaultValues={nullishToEmptyString({
          id: user.id,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          instagramUrl: user.instagramUrl,
          tiktokUrl: user.tiktokUrl,
          websiteUrl: user.websiteUrl,
        })}
        className="max-w-lg"
      />
      <pre className="whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
