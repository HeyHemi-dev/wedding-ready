import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { requireVerifiedAuth } from '@/utils/auth'

import RegistrationForm from './registration-form'

export default async function SupplierRegisterPage() {
  const { authUserId } = await requireVerifiedAuth({ redirectAfterOnboarding: '/suppliers/register' })

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
          <RegistrationForm authUserId={authUserId} />
        </div>
      </Area>
    </Section>
  )
}
