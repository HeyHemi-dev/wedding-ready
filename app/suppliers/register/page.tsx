import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Section from '@/components/ui/section'
import { getCurrentUser } from '@/actions/get-current-user'
import { redirect } from 'next/navigation'
import { SupplierModel } from '@/models/supplier'
import { InsertSupplierRaw } from '@/models/types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Location, Service } from '@/db/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'

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

          <Label>Locations served</Label>
          <Select name="location">
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {enumToPretty(Location).map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Services offered</Label>
          <Select name="service">
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {enumToPretty(Service).map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
  const location = formData.get('location')?.toString() as Location
  const service = formData.get('service')?.toString() as Service
  const website = formData.get('website')?.toString()
  const description = formData.get('description')?.toString()
  const userId = formData.get('userId')?.toString()

  if (!name || !handle || !location || !service || !userId) {
    throw new Error('Missing required fields')
  }

  const user = await getCurrentUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const insertSupplierData: InsertSupplierRaw = {
    name,
    handle,
    description: description ?? null,
    websiteUrl: website ?? null,
    createdByUserId: user.id,
  }

  const locations = [location]
  const services = [service]

  const supplier = await SupplierModel.create(user, insertSupplierData, services, locations)

  redirect(`/supplier/${supplier.handle}`)
}
