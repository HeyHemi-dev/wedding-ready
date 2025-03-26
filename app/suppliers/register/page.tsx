import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Section from '@/components/ui/section'
import { getAuthenticatedUserId } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { SupplierModel } from '@/models/supplier'
import { InsertSupplierRaw } from '@/models/types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Location, Service } from '@/db/constants'
import { enumToPretty } from '@/utils/enum-to-pretty'
import { getCurrentUser } from '@/actions/get-current-user'
import Field from '@/components/form/field'
import { Textarea } from '@/components/ui/textarea'

export default async function SupplierRegisterPage() {
  const authUserId = await getAuthenticatedUserId()

  if (!authUserId) {
    redirect('/sign-in')
  }

  return (
    <Section>
      <form action={handleRegisterSupplier} className="flex flex-col gap-md max-w-md">
        <h2 className="font-medium text-xl mb-4">Register a supplier</h2>
        <Field label="Business name" htmlFor="name">
          <Input name="name" placeholder="Business name" />
        </Field>

        <Field label="Handle" htmlFor="handle">
          <Input name="handle" placeholder="business_name" />
        </Field>

        <Field label="Locations served" htmlFor="location">
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
        </Field>

        <Field label="Services offered" htmlFor="service">
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
        </Field>

        <Field label="Website" htmlFor="website">
          <Input name="website" placeholder="Website url" />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea name="description" placeholder="Description" />
        </Field>

        <Input name="userId" type="hidden" value={authUserId} />
        <Button type="submit" className="self-end">
          Register
        </Button>
      </form>
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
