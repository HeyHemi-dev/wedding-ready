import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { tileKeys } from '@/app/_types/queryKeys'
import { AddCreditButton } from '@/components/tiles/add-credit-button'
import { CreditsList } from '@/components/tiles/credits-list'
import { SaveTileButton } from '@/components/tiles/save-button'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { tileOperations } from '@/operations/tile-operations'
import { getAuthUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'
import { formatRelativeDate } from '@/utils/format-date'

export default async function TilePage({ params }: { params: Promise<{ tileId: string }> }) {
  const { tileId } = await params
  const authUserId = await getAuthUserId()
  const tile = await tileOperations.getById(tileId, authUserId ?? undefined)

  if (!tile) {
    notFound()
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({ queryKey: tileKeys.credits(tileId), queryFn: () => tile.credits })

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="grid grid-cols-1 gap-area laptop:grid-cols-2">
        <Area className="relative overflow-clip rounded-area">
          <Image src={tile.imagePath} alt={tile.title ?? ''} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
          {authUserId && <SaveTileButton tileId={tile.id} authUserId={authUserId} className="absolute inset-0 flex items-start justify-end p-contour" />}
        </Area>
        <Area className="grid grid-rows-[auto_1fr_auto] gap-acquaintance bg-transparent">
          <div className="flex flex-col gap-sibling">
            <div className="ui-small flex flex-row gap-partner text-muted-foreground">
              <span>{formatRelativeDate(tile.createdAt)}</span>
              <span>•</span>
              {tile.location && <span>{valueToPretty(tile.location as string)}</span>}
            </div>
            <h1 className="heading-lg">{tile.title ?? 'Untitled'}</h1>
            {tile.description && <p className="text-muted-foreground">{tile.description}</p>}
          </div>
          <div className="flex flex-col gap-sibling">
            <div className="flex items-center justify-between gap-friend">
              <h2 className="ui-s1">Supplier credits</h2>
              {authUserId === tile.createdByUserId && <AddCreditButton tileId={tile.id} />}
            </div>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <CreditsList tileId={tile.id} />
            </HydrationBoundary>
          </div>
          {/* <div className="flex flex-row-reverse">
            <Button variant={'link'} size="sm">
              Report
            </Button>
          </div> */}
        </Area>
      </div>
    </Section>
  )
}
