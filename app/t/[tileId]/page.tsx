import Image from 'next/image'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { TileModel } from '@/models/tile'

export default async function TilePage({ params }: { params: Promise<{ tileId: string }> }) {
  const { tileId } = await params
  const tile = await TileModel.getRawById(tileId)

  if (!tile) {
    redirect(`/404`)
  }

  return (
    <Section>
      <Card>
        <div className="grid grid-cols-2">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
            <Image src={tile.imagePath ?? ''} alt={tile.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
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
            <CardFooter className="flex flex-row-reverse">
              <Button>Save</Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </Section>
  )
}
