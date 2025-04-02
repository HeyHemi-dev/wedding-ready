import Link from 'next/link'

import { getCurrentUser } from '@/actions/get-current-user'
import { Button } from '@/components/ui/button'
import Section from '@/components/ui/section'
import { UserDetailModel } from '@/models/user'

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const userDetail = await UserDetailModel.getByHandle(handle)

  if (!userDetail) {
    return <div>User not found</div>
  }
  const user = await getCurrentUser()
  const isCurrentUser = user?.id === userDetail.id

  return (
    <Section>
      <h1>UserPage for {userDetail.handle}</h1>
      {isCurrentUser && (
        <Link href={`/account`}>
          <Button>Edit Account Settings</Button>
        </Link>
      )}
    </Section>
  )
}
