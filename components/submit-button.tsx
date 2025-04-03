'use client'

import { JSX, type ComponentProps } from 'react'

import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'

type Props = ComponentProps<typeof Button> & {
  pendingChildren?: string | JSX.Element
}

export function SubmitButton({ children, pendingChildren = 'Submitting...', ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingChildren : children}
    </Button>
  )
}
