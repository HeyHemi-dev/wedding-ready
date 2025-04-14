import { QueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { SaveTileButton } from '@/components/tiles/save-button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { tileKeys } from '@/hooks/queryKeys'
import { TileModel } from '@/models/tile'
import { getAuthenticatedUserId } from '@/utils/auth'
import { valueToPretty } from '@/utils/enum-helpers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon } from 'lucide-react'
import { Area } from '@/components/ui/area'

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
          <CardHeader>
            <h1 className="font-serif text-4xl">{tile.title}</h1>
            {tile.location && <CardDescription>{valueToPretty(tile.location as string)}</CardDescription>}
            {tile.description && <CardDescription>{tile.description}</CardDescription>}
          </CardHeader>
          <CardContent className="flex flex-col gap-sm">
            <h3 className="text-lg font-semibold">Featured Suppliers</h3>
            {tile.suppliers.map((supplier) => (
              <div key={supplier.id} className="flex flex-row items-center justify-between">
                <div>{supplier.name}</div>
                <Link href={`/suppliers/${supplier.handle}`} className="text-sm text-muted-foreground">
                  <Button variant={'ghost'} size="sm" className="flex items-center gap-xxs">
                    <LinkIcon className="h-4 w-4" />
                    <span>{supplier.handle}</span>
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-row-reverse"></CardFooter>
        </div>
      </Area>
    </Section>
  )
}
