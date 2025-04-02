import { InfoIcon } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/actions/get-current-user'
import Field from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserDetailModel } from '@/models/user'
import { userUpdateFormSchema } from '@/models/validations'
import { getAuthenticatedUserId } from '@/utils/auth'

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="grid gap-md">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>
      <h2 className="font-bold text-2xl">User details</h2>
      <form action={handleUpdateUserDetail} className="grid gap-sm">
        <Field label="Handle">
          <Input name="handle" defaultValue={user.handle} required />
        </Field>
        <Field label="Display name">
          <Input name="displayName" defaultValue={user.displayName ?? ''} required />
        </Field>
        <Field label="Bio">
          <Textarea name="bio" defaultValue={user.bio ?? ''} />
        </Field>
        <Field label="Instagram">
          <Input name="instagramUrl" placeholder="https://www.instagram.com/your-handle" defaultValue={user.instagramUrl ?? ''} />
        </Field>
        <Field label="TikTok">
          <Input name="tiktokUrl" placeholder="https://www.tiktok.com/@your-handle" defaultValue={user.tiktokUrl ?? ''} />
        </Field>
        <Field label="Website">
          <Input name="websiteUrl" placeholder="https://www.your-website.com" defaultValue={user.websiteUrl ?? ''} />
        </Field>
        <Input name="userId" type="hidden" value={user.id} />
        <Button type="submit">Update</Button>
      </form>
      <pre className="text-xs font-mono p-3 rounded border text-muted-foreground bg-muted">{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

async function handleUpdateUserDetail(formData: FormData) {
  'use server'
  const userId = formData.get('userId')?.toString()
  const authUserId = await getAuthenticatedUserId()

  if (!authUserId || authUserId !== userId) {
    throw new Error('Unauthorized')
  }

  const user = await UserDetailModel.getById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const formFields = {
    handle: formData.get('handle')?.toString(),
    displayName: formData.get('displayName')?.toString() || null,
    bio: formData.get('bio')?.toString() || null,
    avatarUrl: formData.get('avatarUrl')?.toString() || null,
    instagramUrl: formData.get('instagramUrl')?.toString() || null,
    tiktokUrl: formData.get('tiktokUrl')?.toString() || null,
    websiteUrl: formData.get('websiteUrl')?.toString() || null,
  }

  // Parse and validate the form data
  const result = userUpdateFormSchema.safeParse(formFields)
  if (!result.success) {
    throw new Error(result.error.message)
  }

  const userDetailData = result.data

  // Only check handle availability if it's being changed
  if (userDetailData.handle && userDetailData.handle !== user.handle) {
    if (!(await UserDetailModel.isHandleAvailable(userDetailData.handle))) {
      throw new Error('Handle is already taken')
    }
  }

  await new UserDetailModel(user).update(userDetailData)
  revalidatePath('/account')
}
