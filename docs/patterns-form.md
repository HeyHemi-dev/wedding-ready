# Form Pattern

This document outlines the pattern for creating client-side forms with validation and server actions.

## Schema Definition
Define the schema using Zod for type safety and validation.

```typescript
export const formSchema = z.object({})
export type FormData = z.infer<typeof formSchema>
```

## Form Client Component
Extract the form UI into a separate `use client` component. Use react-hook-form with zodResolver for validation. Combine the Shadcn `<Form>` component and our custom `<FormFieldItem>` to handle labels, errors, and descriptions.

```jsx
'use client'

import { FormData, formSchema } from '@/app/_types/validation-schema'
import { formAction } from './form-action' // co-locate action

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {},
})

async function onSubmit(data: FormData) {
  await formAction({ data })
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form Fields */}
    </form>
  </Form>
)

```

## Form Server Action
Keep the form action in the same folder as the form component. Use `use server` for backend logic: validation, auth checks, and business operations. It should also handle user feedback and navigation.

```typescript
'use server'

import { FormData, formSchema } from '@/app/_types/validation-schema'
import { action } from '@/app/_actions/action'

export async function formAction({ data }: { data: FormData }) {
  const { success, error, data: validatedData } = formSchema.safeParse(data)
  if (!success || error) {
    return { error: error?.flatten().fieldErrors }
  }

  const authUserId = await getAuthUserIdForAction()
  if (!authUserId || validatedData.createdByUserId !== authUserId) {
    return { error: 'Unauthorized' }
  }

  // Do something with the data
  await action.create(validatedData)

  redirect('/success')
}
```