'use client'

import Field from '@/components/form/field'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'

import { signUpFormAction } from './action'

export default function SignUpForm() {
  return (
    <form action={signUpFormAction} className="grid gap-sm">
      <Field label="Email" htmlFor="email">
        <Input name="email" placeholder="you@example.com" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input type="password" name="password" placeholder="Your password" minLength={6} required />
      </Field>
      <Field label="Name" htmlFor="displayName">
        <Input name="displayName" placeholder="Your display name" required />
      </Field>
      <Field label="Handle" htmlFor="handle">
        <Input name="handle" placeholder="your-handle" required />
      </Field>

      <SubmitButton pendingChildren={'Signing up...'}>Sign up</SubmitButton>
    </form>
  )
}
