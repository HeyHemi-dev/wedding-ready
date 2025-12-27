import React from 'react'

import { MailIcon } from 'lucide-react'

import { AppleIcon, GoogleIcon, MicrosoftIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'

const iconVariants = {
  google: <GoogleIcon />,
  apple: <AppleIcon />,
  microsoft: <MicrosoftIcon />,
  email: <MailIcon className="h-4 w-4" />,
}

export interface AuthOptionsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: keyof typeof iconVariants
}

export const AuthOptionsButton = React.forwardRef<HTMLButtonElement, AuthOptionsButtonProps>(({ children, icon, ...props }, ref) => {
  return (
    <Button variant={'outline'} className="relative grid w-full grid-cols-[1fr_auto_1fr] gap-sibling p-2" ref={ref} {...props}>
      {iconVariants[icon]}
      <div className="text-center">{children}</div>
    </Button>
  )
})
AuthOptionsButton.displayName = 'AuthOptionsButton'
