'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { UserUpdateForm } from '../_types/validation-schema'
import { userUpdateFormSchema } from '../_types/validation-schema'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'
import { updateProfileFormAction } from './update-profile-form-action'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { FormFieldItem } from '@/components/form/field'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'

export default function UpdateProfileForm({ defaultValues }: { defaultValues: UserUpdateForm }) {
  const form = useForm<UserUpdateForm>({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues: {
      ...defaultValues,
    },
    mode: 'onBlur',
  })

  async function onSubmit(data: UserUpdateForm) {
    const { data: newValues, error } = await tryCatch(updateProfileFormAction({ data }))
    if (error) {
      toast.error(error.message)
    }
    if (newValues) {
      toast.success('Profile updated')
      form.reset(newValues)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-sm">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormFieldItem label="Display name">
              <FormControl>
                <Input {...field} required />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormFieldItem label="Bio">
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagramUrl"
          render={({ field }) => (
            <FormFieldItem label="Instagram">
              <FormControl>
                <Input {...field} placeholder="https://www.instagram.com/your-handle" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="tiktokUrl"
          render={({ field }) => (
            <FormFieldItem label="TikTok">
              <FormControl>
                <Input {...field} placeholder="https://www.tiktok.com/@your-handle" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormFieldItem label="Website">
              <FormControl>
                <Input {...field} placeholder="https://www.your-website.com" />
              </FormControl>
            </FormFieldItem>
          )}
        />

        <FormField control={form.control} name="id" render={({ field }) => <Input {...field} type="hidden" />} />

        <SubmitButton pendingChildren="Updating..." type="submit" className="self-end">
          Update
        </SubmitButton>
      </form>
    </Form>
  )
}
