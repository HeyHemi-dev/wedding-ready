import { redirect } from 'next/navigation'

import { Section } from '@/components/ui/section'
import { getAuthUserId } from '@/utils/auth'

import RegistrationForm from './registration-form'
import { Area } from '@/components/ui/area'

export default async function SupplierRegisterPage() {
  const authUserId = await getAuthUserId()

  if (!authUserId) {
    redirect('/sign-in')
  }

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <Area>
        <div className="mx-auto grid w-full max-w-md gap-friend">
          <div className="flex flex-col gap-spouse">
            <h1 className="heading-lg">Build Your Supplier Profile</h1>
            <p className="text-sm text-muted-foreground">
              This is your business&apos; public showcase on WeddingReady, where couples can discover your amazing work. You will be able to create tiles and
              highlight your business, making it easy for couples to find you.
            </p>
          </div>
          <RegistrationForm createdByUserId={authUserId} />
        </div>
      </Area>
    </Section>
  )
}
