import { QueryClient } from '@tanstack/react-query'
import { ArrowRight, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { tileKeys } from '@/app/_hooks/queryKeys'
import { SaveTileButton } from '@/components/tiles/save-button'
import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { Separator } from '@/components/ui/separator'
import { TileModel } from '@/models/tile'
import { getAuthUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'

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
    <Section className="min-h-svh-minus-header">
      <div className="grid grid-cols-1 gap-area md:grid-cols-2">
        <Area className="relative overflow-clip rounded-area p-contour">
          <Image src={tile.imagePath} alt={tile.title ?? ''} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
          {authUserId && <SaveTileButton tileId={tile.id} authUserId={authUserId} className="absolute right-0 top-0 p-2" />}
        </Area>
        <Area className="grid grid-rows-[auto_1fr_auto] gap-acquaintance bg-transparent">
          <div className="flex flex-col gap-sibling">
            <div className="ui-small gap-partner flex flex-row text-muted-foreground">
              <span>{formatRelativeDate(tile.createdAt)}</span>
              <span>•</span>
              {tile.location && <span>{valueToPretty(tile.location as string)}</span>}
            </div>
            <h1 className="heading-lg">{tile.title ?? 'Untitled'}</h1>
            {tile.description && <p className="text-muted-foreground">{tile.description}</p>}
          </div>
          <div className="flex flex-col gap-sibling">
            <div className="flex items-center justify-between gap-friend">
              <h3 className="ui-s1">Supplier credits</h3>
              <Button variant={'ghost'} size="sm" className="flex items-center gap-spouse">
                <Plus className="h-4 w-4" />
                <span>Add supplier</span>
              </Button>
            </div>
            {tile.suppliers.map((supplier) => (
              <SupplierCredit key={supplier.id} name={supplier.name} contribution={'Contribution description'} href={`/suppliers/${supplier.handle}`} />
            ))}
          </div>
          <div className="flex flex-row-reverse">
            <Button variant={'link'} size="sm">
              Report
            </Button>
          </div>
        </Area>
      </div>
    </Section>
  )
}

function SupplierCredit({ name, contribution, href }: { name: string; contribution: string; href: string }) {
  return (
    <div className="flex flex-row items-center justify-between gap-sibling">
      <div className="gap-partner flex">
        <Link href={href} className="ui-small">
          {name}
        </Link>
        <span className="ui-small text-muted-foreground">{contribution}</span>
      </div>
    </div>
  )
}

/**
 * Given a past Date, returns one of:
 *  - "less than 1 minute ago"
 *  - "about 1 minute ago"
 *  - "about X minutes ago"
 *  - "about 1 hour ago"
 *  - "about X hours ago"
 *  - "about 1 day ago"
 *  - "about X days ago"
 */
export function formatRelativeDate(date: Date): string {
  const now = Date.now()

  const diffSec = Math.floor((now - date.getTime()) / 1000)
  if (diffSec < 60) {
    return 'less than 1 minute ago'
  }
  if (diffSec < 120) {
    return 'about 1 minute ago'
  }

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) {
    return `about ${diffMin} minutes ago`
  }
  if (diffMin < 120) {
    return 'about 1 hour ago'
  }

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) {
    return `about ${diffHr} hours ago`
  }
  if (diffHr < 48) {
    return 'about 1 day ago'
  }

  const diffDay = Math.floor(diffHr / 24)
  return `about ${diffDay} days ago`
}
