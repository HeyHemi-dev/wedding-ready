import { QueryClient } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SaveTileButton } from '@/components/tiles/save-button'
import { Area } from '@/components/ui/area'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { Separator } from '@/components/ui/separator'
import { tileKeys } from '@/hooks/queryKeys'
import { TileModel } from '@/models/tile'
import { getAuthenticatedUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'

export default async function TilePage({ params }: { params: Promise<{ tileId: string }> }) {
  const { tileId } = await params
  const authUserId = await getAuthenticatedUserId()
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
      <Area className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="relative bg-muted">
          <Image src={tile.imagePath} alt={tile.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />

          {authUserId && <SaveTileButton tileId={tile.id} authUserId={authUserId} className="absolute right-0 top-0 p-2" />}
        </div>
        <div className="grid grid-rows-[auto_1fr_auto] gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">{tile.title}</h1>
            {tile.location && <p className="text-sm text-muted-foreground">{valueToPretty(tile.location as string)}</p>}
            {tile.description && <p className="text-sm text-muted-foreground">{tile.description}</p>}
          </div>
          <div className="flex flex-col gap-sm">
            <Separator />
            <h3 className="text-lg font-semibold">Featured Suppliers</h3>
            {tile.suppliers.map((supplier) => (
              <div key={supplier.id} className="flex flex-row items-center justify-between">
                <div>{supplier.name}</div>
                <Link href={`/suppliers/${supplier.handle}`} className="text-sm text-muted-foreground">
                  <Button variant={'ghost'} size="sm" className="flex items-center gap-xxs">
                    <span>{supplier.handle}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
            <Button variant={'outline'}>Add Supplier</Button>
          </div>
          <div className="flex flex-row-reverse">
            <Button variant={'link'} size="sm">
              Report
            </Button>
          </div>
        </div>
      </Area>
    </Section>
  )
}
