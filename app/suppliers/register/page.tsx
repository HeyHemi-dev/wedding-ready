import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import SupplierActions from '@/models/supplier-actions'
import { InsertSupplier } from '@/models/suppliers'
import { Label } from '@/components/ui/label'
export default async function SupplierRegisterPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <Section>
      <div className="flex flex-col gap-6">
        <h2 className="font-medium text-xl mb-4">Register a supplier</h2>
        <form action={handleRegisterSupplier} className="grid grid-cols-[auto_1fr] items-center gap-4">
          <Label>Business name</Label>
          <Input name="name" placeholder="Name" />

          <Label>Handle</Label>
          <Input name="handle" placeholder="Handle" />

          <Label>Website</Label>
          <Input name="website" placeholder="Website url" />

          <Label>Description</Label>
          <Input name="description" placeholder="Description" />
          <Input name="userId" type="hidden" value={user.id} />
          <Button type="submit" className="col-span-2">
            Register
          </Button>
        </form>
      </div>
    </Section>
  )
}

async function handleRegisterSupplier(formData: FormData) {
  'use server'
  const name = formData.get('name')?.toString()
  const handle = formData.get('handle')?.toString()
  const website = formData.get('website')?.toString()
  const description = formData.get('description')?.toString()
  const userId = formData.get('userId')?.toString()

  if (!name || !handle || !userId) {
    throw new Error('Missing required fields')
  }

  const user = await getCurrentUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const insertSupplierData: InsertSupplier = {
    name,
    handle,
    description: description ?? null,
    websiteUrl: website ?? null,
    createdByUserId: user.id,
  }

  const supplier = await SupplierActions.create(user, insertSupplierData)

  redirect(`/supplier/${supplier.handle}`)
}
