import { InfoIcon } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import { userUpdateFormSchema } from '@/app/_types/validation-schema'
import Field from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserDetailModel } from '@/models/user'
import { getAuthUserId } from '@/utils/auth'
import UpdateProfileForm from './update-profile-form'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <>
      <h2 className="col-start-2 row-start-1 font-serif text-4xl">Update your public profile</h2>
      <div className="col-start-2 row-start-2 grid gap-md">
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
        />
        <pre className="whitespace-pre-wrap rounded border bg-muted p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </>
  )
}
