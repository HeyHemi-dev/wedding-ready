import Link from 'next/link'

import { Supplier } from '@/models/types'
import { valueToPretty } from '@/utils/enum-helpers'
import { Star } from 'lucide-react'
import Image from 'next/image'

export function SuppliersList({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          href={`/suppliers/${supplier.handle}`}
          mainImage={'https://images.unsplash.com/photo-1606216794074-735e91aa2c92'}
          thumbnailImages={['https://images.unsplash.com/photo-1649615644622-6d83f48e69c5', 'https://images.unsplash.com/photo-1665607437981-973dcd6a22bb']}
          name={supplier.name}
          subtitle={supplier.locations.map((location) => valueToPretty(location)).join(', ')}
          stat={150}
        />
      ))}
    </div>
  )
}

type SupplierCardProps = {
  href: string
  mainImage: string
  thumbnailImages: string[]
  name: string
  subtitle: string
  stat: number
  avatar?: string
}

export function SupplierCard({ name, subtitle, mainImage, thumbnailImages, stat, href, avatar }: SupplierCardProps) {
  return (
    <Link href={href} className="grid gap-xs transition-colors hover:bg-accent/80 focus:bg-accent/80">
      <div className="grid max-w-full grid-cols-3 grid-rows-2 gap-[1px] overflow-hidden rounded-md">
        <div className="relative col-span-2 row-span-2 aspect-square bg-white">
          <Image src={mainImage} alt={name} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="relative aspect-square bg-white">
          <Image src={thumbnailImages[0]} alt={name} fill sizes="50vw" className="object-cover" />
        </div>
        <div className="relative aspect-square bg-white">
          <Image src={thumbnailImages[1]} alt={name} fill sizes="50vw" className="object-cover" />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-xs px-xs">
        <div className="flex gap-xs">
          {avatar && <Image src={avatar} alt={name} className="h-[32px] w-[32px] rounded-full bg-white" />}
          <div>
            <h2 className="text-sm font-medium">{name}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-xxs self-start text-sm text-muted-foreground">
          <Star size={16} />
          <p>1.5k</p>
        </div>
      </div>
    </Link>
  )
}
