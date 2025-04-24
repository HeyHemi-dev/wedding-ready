import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import UpdateProfileForm from './update-profile-form'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <>
      <h1 className="font-serif text-4xl">Update your public profile</h1>
      <div className="grid gap-md">
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
    </>
  )
}
