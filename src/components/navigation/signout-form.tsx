'use client'

import { useQueryClient } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { userKeys } from '@/app/_types/queryKeys'
import { Form } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'

import { SignOutFormAction } from './signout-form-action'

export function SignOutForm({ children }: { children: React.ReactNode }) {
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
      queryKey: userKeys.authUser(),
    })
    if (data.redirectTo !== pathname) {
      router.push(data.redirectTo)
    }
    router.refresh()
    toast.success('You have beeen signed out')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <button type="submit" className="block">
          {children}
        </button>
      </form>
    </Form>
  )
}
