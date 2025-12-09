import { Suspense } from 'react'

import { notFound } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { handleSchema } from '@/app/_types/validation-schema'
import { ActionBar } from '@/components/action-bar/action-bar'
import { noTiles, TileListSkeleton } from '@/components/tiles/tile-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'

import { UserTiles } from './user-tiles'

export default async function UserPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const { success, error: parseError } = handleSchema.safeParse(handle)
  if (!success || parseError) return notFound()

  const user = await userOperations.getByHandle(handle)
  if (!user) return notFound()

  const authUserId = await getAuthUserId()
  const isCurrentUser = authUserId === user.id

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-rows-[auto_1fr] gap-area">
        <Area className="grid auto-rows-max gap-close-friend">
          <p className="ui-small text-muted-foreground">@{user.handle}</p>
          <div className="flex flex-col gap-partner">
            <h1 className="heading-lg">{user.displayName}</h1>
            <p>{user.bio}</p>
          </div>
          <div className="flex items-center gap-partner text-muted-foreground">
            {user.instagramUrl && <p>Instagram</p>}
            {user.tiktokUrl && <p>Tiktok</p>}
            {user.websiteUrl && <p>Website</p>}
          </div>
        </Area>

        <div className="grid grid-rows-[auto_1fr] gap-area">
          <ErrorBoundary
            fallback={noTiles({
              message: 'Error loading tiles',
              cta: { text: 'Retry', redirect: `/u/${handle}` },
            })}>
            {isCurrentUser && (
              <ActionBar className="col-span-full">
                <div className="flex place-self-end"></div>
              </ActionBar>
            )}
            <Suspense fallback={<TileListSkeleton />}>
              <UserTiles user={user} authUserId={authUserId} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Section>
  )
}
