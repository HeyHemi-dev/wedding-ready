# Form Pattern

This document outlines the pattern for creating client-side forms with validation and server actions.

## Schema Definition
Define the schema using Zod for type safety and validation. Place all schemas in `_types/validation-schema.ts`.

```typescript
export const formSchema = z.object({})
export type FormData = z.infer<typeof formSchema>
```

## Form Client Component
Extract the form UI into a separate `use client` component. Use react-hook-form with zodResolver for validation. Use Shadcn's `<Form>` components with our custom `<FormFieldItem>` to handle labels, errors, and descriptions. Handle user feedback and navigation on client,

```tsx
'use client'

import { FormData, formSchema } from '@/app/_types/validation-schema'
import { formAction } from './form-action' // co-locate action

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {},
})

async function onSubmit(data: FormData) {
  const { data: result, error } = await tryCatch(formAction({ data }))
  // toasts and navigation
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
Keep the form action in the same folder as the form component. Use `use server` for backend logic: validation, auth checks, and business actions.

```typescript
'use server'

import { FormData, formSchema } from '@/app/_types/validation-schema'
import { action } from '@/app/_actions/action'

export async function formAction({ data }: { data: FormData }) {
  // validate
  const { success, error, data: validatedData } = formSchema.safeParse(data)
  if (!success || error) {
    throw new Error(JSON.stringify(error?.flatten().fieldErrors))
  }

  // auth
  const { data: authUserId, error: authError } = await tryCatch(getAuthUserIdFromSupabase())
  if (authError || !authUserId || validatedData.createdByUserId !== authUserId) {
    throw new Error('Unauthorized')
  }

  // do business actions
  const { data: result, error: actionError } = await tryCatch(action.create(validatedData)))
  if (actionError || !result) {
    throw new Error(actionError?.message || 'Operation failed')
  }

  return result
}
```


## Best Practices

1. **Schema Organization**
   - Keep all form schemas in `_types/validation-schema.ts`
   - Use descriptive error messages in schema definitions
   - Leverage Zod's built-in validation methods

2. **Component Structure**
   - Use Shadcn form components for consistent styling
   - Implement `FormFieldItem` for standardized field layout
   - Keep form state management in the client component

3. **Error Handling**
   - Use toast notifications for user feedback
   - Implement proper error boundaries
   - Handle both client and server-side validation errors

4. **Performance**
   - Use debouncing for real-time validations
   - Validate on blur for better UX
   - Implement proper loading states