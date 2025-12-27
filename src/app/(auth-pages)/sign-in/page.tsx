import { redirect } from 'next/navigation'

import { SearchParams } from '@/app/_types/generics'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthMessage, messageSchema } from '@/components/auth/auth-message'
import { parseSearchParams } from '@/utils/api-helpers'
import { getAuthUserId } from '@/utils/auth'
import { tryCatch } from '@/utils/try-catch'

import { LoginWithEmailPasswordFormButton } from './login-with-email-password-form'
import LoginWithGoogleForm from './login-with-google-form'

export default async function Login(props: { searchParams: Promise<SearchParams> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  const { data: message } = await tryCatch(parseSearchParams(searchParams, messageSchema))

  {
    return (
      <AuthCard title="Log in to your Wedding Ready account">
        <LoginWithGoogleForm />
        <hr />
        <LoginWithEmailPasswordFormButton />
        {message && <AuthMessage message={message} />}
      </AuthCard>
    )
  }
}
