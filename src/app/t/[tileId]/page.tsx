import { QueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { tileKeys } from '@/app/_types/queryKeys'
import { SaveTileButton } from '@/components/tiles/save-button'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { TileModel } from '@/models/tile'
import { getAuthUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'
import { formatRelativeDate } from '@/utils/format-date'

export default async function TilePage({ params }: { params: Promise<{ tileId: string }> }) {
  const { tileId } = await params
  const authUserId = await getAuthUserId()
  const tile = await TileModel.getById(tileId, authUserId ?? undefined)

  if (!tile) {
    notFound()
  }

  if (authUserId && tile.isSaved) {
    const queryClient = new QueryClient()
    queryClient.setQueryData(tileKeys.saveState(tileId, authUserId), { authUserId, tileId: tile.id, isSaved: tile.isSaved })
  }

  return (
    <Section className="min-h-svh-minus-header pt-0">
      <div className="laptop:grid-cols-2 grid grid-cols-1 gap-area">
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
              {/* <Button variant={'ghost'} size="sm" className="flex items-center gap-spouse">
                <Plus className="h-4 w-4" />
                <span>Add supplier</span>
              </Button> */}
            </div>
            {tile.suppliers.map((supplier) => (
              <SupplierCredit key={supplier.id} name={supplier.name} contribution={'Contribution description'} href={`/suppliers/${supplier.handle}`} />
            ))}
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

function SupplierCredit({ name, contribution, href }: { name: string; contribution: string; href: string }) {
  return (
    <div className="flex flex-row items-center justify-between gap-sibling">
      <div className="flex gap-partner">
        <Link href={href} passHref>
          <h3 className="ui-small-s1">{name}</h3>
        </Link>
        <span className="ui-small text-muted-foreground">{contribution}</span>
      </div>
    </div>
  )
}
