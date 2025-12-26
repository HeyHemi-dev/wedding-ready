import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FormMessage, Message } from '@/components/form/form-message'
import { getAuthUserId } from '@/utils/auth'
import { AuthCard } from '@/components/auth/auth-card'

import SignUpForm, { SignUpWithEmailPasswordFormButton } from './signup-form'
import LoginWithGoogleForm from '../sign-in/login-with-google-form'

export default async function Signup(props: { searchParams: Promise<Message> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  return (
    <AuthCard title="Sign up for your Wedding Ready account">
      <LoginWithGoogleForm />
      <hr />
      <SignUpWithEmailPasswordFormButton />
    </AuthCard>
  )
}
