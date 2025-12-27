import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SearchParams } from '@/app/_types/generics'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthMessage, Message, messageSchema } from '@/components/form/auth-message'
import { parseSearchParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { SignUpWithEmailPasswordFormButton } from './signup-form'
import LoginWithGoogleForm from '../sign-in/login-with-google-form'

export default async function Signup(props: { searchParams: Promise<SearchParams> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  const { data: message } = await tryCatch(parseSearchParams(searchParams, messageSchema))

  return (
    <AuthCard title="Sign up for your Wedding Ready account">
      <LoginWithGoogleForm />
      <hr />
      <SignUpWithEmailPasswordFormButton />
      {message && <AuthMessage message={message} />}
    </AuthCard>
  )
}
