'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SupplierUpdateForm, supplierUpdateFormSchema } from '@/app/_types/validation-schema'
import { FormFieldItem } from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/shadcn-utils'
import { tryCatch } from '@/utils/try-catch'

import { updateSupplierFormAction } from './update-supplier-form-action'

export default function UpdateSupplierForm({
  defaultValues,
  supplierId,
  authUserId,
}: {
  defaultValues: SupplierUpdateForm
  supplierId: string
  authUserId: string
}) {
  const form = useForm<SupplierUpdateForm>({
    resolver: zodResolver(supplierUpdateFormSchema),
    defaultValues: {
      ...defaultValues,
    },
  })

  async function onSubmit(data: SupplierUpdateForm) {
    const { data: newValues, error } = await tryCatch(updateSupplierFormAction(supplierId, data, authUserId))
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Supplier updated')
    form.reset(newValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-close-friend')}>
        <div className="grid gap-sibling">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormFieldItem label="Business name">
                <FormControl>
                  <Input {...field} required />
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
                  <Input {...field} />
                </FormControl>
              </FormFieldItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormFieldItem label="Description">
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormFieldItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-close-friend">
          <Button variant={'ghost'} type="button" onClick={() => form.reset()} disabled={!form.formState.isDirty || form.formState.isSubmitting}>
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
