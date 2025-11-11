import { Suspense } from 'react'

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'

import { Href } from '@/app/_types/generics'
import { userKeys } from '@/app/_types/queryKeys'
import { Skeleton } from '@/components/ui/skeleton'
import { userOperations } from '@/operations/user-operations'
import { getAuthUserId } from '@/utils/auth'

import HeaderAuth from './header-auth'
import { NavLink } from './nav-link'

export default async function Header() {
  const authUserId = await getAuthUserId()
  const queryClient = new QueryClient()
  if (authUserId) {
    await queryClient.prefetchQuery({ queryKey: userKeys.authUser(), queryFn: () => userOperations.getById(authUserId) })
  }

  return (
    <header className="grid h-header grid-cols-siteLayout grid-rows-[0_1fr_0] gap-y-area">
      <div className="col-start-2 col-end-3 row-start-2 row-end-3 grid h-header-content grid-cols-[auto_1fr_auto] gap-friend">
        <div className="-my-1 aspect-[12/7]">
          <Link href={authUserId ? '/feed' : '/'} className="relative block h-full rounded-full p-contour hover:bg-primary/80" passHref>
            <Image src={'/assets/WeddingReady_icon.png'} alt="WeddingReady" fill sizes="300px" className="object-contain" priority />
          </Link>
        </div>
        <nav className="flex items-center gap-sibling">
          <NavLink link={{ href: '/find-suppliers', label: 'Find Suppliers' }} />
          {/* <NavLink link={{ href: '/articles', label: 'Advice' }} /> */}
        </nav>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<Skeleton className="aspect-[12/7] rounded-full" />}>
            <HeaderAuth />
          </Suspense>
        </HydrationBoundary>
      </div>
    </header>
  )
}
