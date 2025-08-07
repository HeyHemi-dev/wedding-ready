import { SquarePenIcon } from 'lucide-react'
import Link from 'next/link'
import { ErrorBoundary } from 'react-error-boundary'

import { getCurrentUser } from '@/app/_actions/get-current-user'
import { ActionBar } from '@/components/action-bar/action-bar'
import { noTiles } from '@/components/tiles/tile-list'
import { Area } from '@/components/ui/area'
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
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-cols-2 grid-rows-[auto_1fr] gap-area">
        <Area className="grid auto-rows-max gap-close-friend">
          <p className="ui-small text-muted-foreground">@{userDetail.handle}</p>
          <div className="flex flex-col gap-partner">
            <h1 className="heading-lg">{userDetail.displayName}</h1>
            <p>{userDetail.bio}</p>
          </div>
          <div className="flex items-center gap-partner text-muted-foreground">
            {userDetail.instagramUrl && <p>Instagram</p>}
            {userDetail.tiktokUrl && <p>Tiktok</p>}
            {userDetail.websiteUrl && <p>Website</p>}
          </div>
        </Area>
        <Area className="grid auto-rows-max gap-friend">
          {isCurrentUser && (
            <>
              <QuickLink href={`/account`} label="Edit Profile" Icon={SquarePenIcon} />
              {/* <QuickLink href={`/account`} label="Manage Preferences" Icon={Settings2Icon} />
              <QuickLink href={''} label="Get Public Share Link" Icon={Share} /> */}
            </>
          )}
        </Area>

        <div className="col-span-full grid grid-rows-[auto_1fr] gap-area">
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
            <UserTiles user={userDetail} authUserId={authUser ? authUser.id : null} />
          </ErrorBoundary>
        </div>
      </div>
    </Section>
  )
}

function QuickLink({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) {
  return (
    <Link href={href} className="flex items-center gap-partner">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-primary p-0 text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <p>{label}</p>
    </Link>
  )
}
