import { redirect } from 'next/navigation'

import { SearchParams } from '@/app/_types/generics'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthMessage, messageSchema } from '@/components/auth/auth-message'
import { getNextUrl, parseSearchParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import SignUpWithEmailPasswordForm from './signup-form'
import LoginWithGoogleForm from '@/app/(auth-pages)/sign-in/login-with-google-form'

export default async function Signup(props: { searchParams: Promise<SearchParams> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  const next = await getNextUrl(searchParams)
  const { data: message } = await tryCatch(parseSearchParams(searchParams, messageSchema))

  return (
    <AuthCard title="Sign up for your Wedding Ready account">
      <LoginWithGoogleForm next={next} />
      <hr />
      <SignUpWithEmailPasswordForm next={next} />
      {message && <AuthMessage message={message} />}
    </AuthCard>
  )
}
