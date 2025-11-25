'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/shadcn-utils'
import { tryCatch } from '@/utils/try-catch'

import { updateProfileFormAction } from './update-profile-form-action'
import { userUpdateFormSchema, UserUpdateForm } from '../_types/validation-schema'

export default function UpdateProfileForm({ defaultValues, className }: { defaultValues: UserUpdateForm; className?: string }) {
  const form = useForm<UserUpdateForm>({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues,
    mode: 'onBlur',
  })

  async function onSubmit(data: UserUpdateForm) {
    const { data: newValues, error } = await tryCatch(updateProfileFormAction(data))
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-close-friend', className)}>
        <div className="grid gap-sibling">
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
        </div>

        <div className="flex justify-end gap-close-friend">
          <Button variant={'ghost'} type="button" onClick={() => form.reset(defaultValues)} disabled={!form.formState.isDirty || form.formState.isSubmitting}>
            Cancel
          </Button>
          <SubmitButton pendingChildren="Saving..." type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
            Save Changes
          </SubmitButton>
        </div>
      </form>
    </Form>
  )
}
