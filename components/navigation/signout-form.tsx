'use client'

import { LogOutIcon } from 'lucide-react'

import { SignOutFormAction } from './signout-form-action'
import { toast } from 'sonner'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'
import { usePathname, useRouter } from 'next/navigation'

export function MenuSignOutForm() {
  const pathname = usePathname()
  const router = useRouter()
  const form = useForm({})

  async function onSubmit() {
    const { data, error } = await tryCatch(SignOutFormAction({ pathname }))
    if (error) {
      toast.error(error.message)
      return
    }
    if (data.redirectTo !== pathname) {
      router.push(data.redirectTo)
    }
    router.refresh()
    toast.success('You have beeen signed out')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DropdownMenuItem className="ui" asChild>
          <button type="submit" className="w-full">
            <LogOutIcon />
            Sign out
          </button>
        </DropdownMenuItem>
      </form>
    </Form>
  )
}
