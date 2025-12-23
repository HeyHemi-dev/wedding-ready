import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import Field from '@/components/form/field'
import { FormMessage, Message } from '@/components/form/form-message'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAuthUserId } from '@/utils/auth'
import { PARAMS } from '@/utils/constants'

import LoginWithEmailPasswordForm from './login-with-email-password-form'
import LoginWithGoogleForm from './login-with-google-form'
import { signInFormAction } from './signin-form-action'

export default async function Login(props: { searchParams: Promise<Message> }) {
  // If user is already logged in, they don't need to be here.
  const authUserId = await getAuthUserId()
  if (authUserId) {
    redirect('/feed')
  }

  const searchParams = await props.searchParams
  const headersList = await headers()
  const referer = headersList.get(PARAMS.NEXT) || '/feed'

  {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="signup" className="grid gap-sibling">
          <TabsList className="">
            <TabsTrigger value="signup">Create Account</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <AuthCard title="Create your Wedding Ready account">
              <LoginWithGoogleForm />
            </AuthCard>
          </TabsContent>
          <TabsContent value="login" className="grid gap-friend">
            <AuthCard title="Log in to your Wedding Ready account">
              <LoginWithGoogleForm />
              <hr />
              <h2 className="ui-small-s1 text-muted-foreground">Continue with email and password</h2>
              <LoginWithEmailPasswordForm />
            </AuthCard>
          </TabsContent>
        </Tabs>
      </div>
    )
  }
}

function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-friend">
      <div className="grid">
        <p className="ui-large">Bookable wedding inspiration</p>
        <h1 className="ui-large text-muted-foreground">{title}</h1>
      </div>
      {children}
      <p className="ui-small text-muted-foreground">
        {'By continuing, you acknowledge that you understand and agree to our '}
        <Link className="underline" href="/terms">
          Terms of Service
        </Link>
        {' and '}
        <Link className="underline" href="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
