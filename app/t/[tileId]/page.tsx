import { QueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { SaveTileButton } from '@/components/tiles/save-button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { tileKeys } from '@/hooks/queryKeys'
import { TileModel } from '@/models/tile'
import { getAuthenticatedUserId } from '@/utils/auth'

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
    <Section>
      <Card>
        <div className="grid grid-cols-2">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
            <Image src={tile.imagePath ?? ''} alt={tile.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
            {authUserId && <SaveTileButton tileId={tile.id} authUserId={authUserId} className="absolute right-0 top-0 p-2" />}
          </div>
          <div className="grid grid-rows-[auto_1fr_auto]">
            <CardHeader>
              <CardTitle>{tile.title}</CardTitle>
              <CardDescription>{tile.location}</CardDescription>
              <CardDescription>{tile.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h3>Suppliers</h3>
            </CardContent>
            <CardFooter className="flex flex-row-reverse"></CardFooter>
          </div>
        </div>
      </Card>
    </Section>
  )
}
