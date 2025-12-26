import { redirect } from 'next/navigation'

import { getAuthUserId } from '@/utils/auth'
import { AuthCard } from '@/components/auth/auth-card'

import { LoginWithEmailPasswordFormButton } from './login-with-email-password-form'
import LoginWithGoogleForm from './login-with-google-form'

export default async function Login() {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  {
    return (
      <AuthCard title="Log in to your Wedding Ready account">
        <LoginWithGoogleForm />
        <hr />
        <LoginWithEmailPasswordFormButton />
      </AuthCard>
    )
  }
}
