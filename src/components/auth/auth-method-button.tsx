'use client'

import React from 'react'

import { MailIcon } from 'lucide-react'

import { AppleIcon, GoogleIcon, MicrosoftIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { SignInMethod, SIGN_IN_METHODS } from '@/utils/constants'
import { getLastSignInMethod } from '@/utils/local-storage'

const iconVariants = {
  google: <GoogleIcon />,
  apple: <AppleIcon />,
  microsoft: <MicrosoftIcon />,
  email: <MailIcon className="h-4 w-4" />,
}
type IconKey = keyof typeof iconVariants

export interface AuthMethodButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconKey
  method: SignInMethod
}

export function AuthMethodButton({ children, icon, method, ...props }: AuthMethodButtonProps) {
  const [lastSignInMethod, setLastSignInMethod] = React.useState<SignInMethod | null>(null)

  React.useEffect(() => {
    setLastSignInMethod(getLastSignInMethod())
  }, [])

  const isLastUsed = lastSignInMethod === method

  return (
    <div className="grid gap-xs">
      <Button variant={'outline'} className="relative grid w-full grid-cols-[1fr_auto_1fr] gap-sibling p-2" {...props}>
        {iconVariants[icon]}
        <div className="text-center">{children}</div>
      </Button>
      {isLastUsed && <p className="ui-small text-center text-muted-foreground">Last signed in with {getMethodDisplayName(method)}</p>}
    </div>
  )
}

function getMethodDisplayName(method: SignInMethod): string {
  if (method === SIGN_IN_METHODS.EMAIL) return 'email'
  if (method === SIGN_IN_METHODS.GOOGLE) return 'Google'
  return method
}
