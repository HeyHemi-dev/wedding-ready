import { redirect } from 'next/navigation'

import { getAuthUserId } from '@/utils/auth'
import { AuthCard } from '@/components/auth/auth-card'
import { AuthMessage, messageSchema } from '@/components/form/auth-message'

import { LoginWithEmailPasswordFormButton } from './login-with-email-password-form'
import LoginWithGoogleForm from './login-with-google-form'
import { PARAMS } from '@/utils/constants'
import { SearchParams } from '@/app/_types/generics'
import { parseSearchParams } from '@/utils/api-helpers'
import { tryCatch } from '@/utils/try-catch'

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
