import { redirect } from 'next/navigation'

import { Section } from '@/components/ui/section'

import { getAuthenticatedUserId } from '@/utils/auth'
import RegistrationForm from './registration-form'

export default async function SupplierRegisterPage() {
  const authUserId = await getAuthenticatedUserId()

  if (!authUserId) {
    redirect('/sign-in')
  }

  return (
    <Section>
      <div className="mx-auto grid max-w-md gap-md">
        <h2 className="text-2xl font-medium">Register a supplier</h2>
        <RegistrationForm createdByUserId={authUserId} />
      </div>
    </Section>
  )
}
