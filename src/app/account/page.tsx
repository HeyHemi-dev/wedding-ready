import { userOperations } from '@/operations/user-operations'
import { requireVerifiedAuth } from '@/utils/auth'
import { nullToEmptyString } from '@/utils/empty-strings'

import UpdateProfileForm from './update-profile-form'

export default async function AccountPage() {
  const { authUserId } = await requireVerifiedAuth()

  const user = await userOperations.getById(authUserId)

  return (
    <div className="grid gap-friend">
      <h1 className="heading-lg">Update your personal profile</h1>
      <UpdateProfileForm
        defaultValues={{
          id: user.id,
          displayName: user.displayName,
          bio: nullToEmptyString(user.bio),
          avatarUrl: nullToEmptyString(user.avatarUrl),
          instagramUrl: nullToEmptyString(user.instagramUrl),
          tiktokUrl: nullToEmptyString(user.tiktokUrl),
          websiteUrl: nullToEmptyString(user.websiteUrl),
        }}
        className="max-w-lg"
      />
      <pre className="whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
