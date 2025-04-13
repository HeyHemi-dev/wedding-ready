import Link from 'next/link'
import { ErrorBoundary } from 'react-error-boundary'

import { getCurrentUser } from '@/actions/get-current-user'
import { noTiles } from '@/components/tiles/tile-list'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { UserDetailModel } from '@/models/user'

import { UserTiles } from './user-tiles'

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const userDetail = await UserDetailModel.getByHandle(handle)

  if (!userDetail) {
    return <div>User not found</div>
  }
  const authUser = await getCurrentUser()
  const isCurrentUser = authUser?.id === userDetail.id

  return (
    <Section>
      <h1>{userDetail.displayName}</h1>
      <p>{userDetail.bio}</p>
      {isCurrentUser && (
        <div>
          <Button asChild>
            <Link href={`/account`}>Edit Account Settings</Link>
          </Button>
        </div>
      )}

      <ErrorBoundary
        fallback={noTiles({
          message: 'Error loading tiles',
          cta: { text: 'Retry', redirect: `/u/${handle}` },
        })}>
        <UserTiles user={userDetail} authUserId={authUser?.id} />
      </ErrorBoundary>
    </Section>
  )
}
