'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { queryKeys } from '@/app/_types/keys'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'

import { SignOutFormAction } from './signout-form-action'

export function SignOutFormMenuItem({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const form = useForm({})
  const queryClient = useQueryClient()

  async function onSubmit() {
    const { data, error } = await tryCatch(SignOutFormAction({ pathname }))
    if (error) {
      toast.error(error.message)
      return
    }
    queryClient.removeQueries({
      queryKey: queryKeys.authUser(),
    })
    if (data.redirectTo !== pathname) {
      router.push(data.redirectTo)
    }
    router.refresh()
    toast.success('You have beeen signed out')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DropdownMenuItem
          className="ui"
          onSelect={(event) => {
            event.preventDefault()
            form.handleSubmit(onSubmit)()
          }}>
          {children}
        </DropdownMenuItem>
      </form>
    </Form>
  )
}
