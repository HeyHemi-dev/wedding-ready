'use client'

import { LogOutIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Form } from '@/components/ui/form'
import { tryCatch } from '@/utils/try-catch'

import { SignOutFormAction } from './signout-form-action'

export function SignOutForm() {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <button
          type="submit"
          data-testid="sign-out"
          className="ui relative flex w-full cursor-default select-none items-center gap-2 rounded-inside px-2 py-1.5 outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          <LogOutIcon />
          Sign out
        </button>
      </form>
    </Form>
  )
}
