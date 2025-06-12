import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function SuppliersGrid({ children }: { children: React.ReactNode }) {
  return <div className="wide:grid-cols-3 laptop:grid-cols-2 grid grid-cols-1 gap-lg">{children}</div>
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
    <Link href={href} className="grid gap-xs rounded transition-all hover:bg-primary/80 hover:shadow-contour focus:bg-primary/80">
      <div className="grid max-w-full grid-cols-3 grid-rows-2 gap-[1px] overflow-hidden rounded">
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
        <div className="flex max-w-[200px] gap-xs">
          {avatar && <Image src={avatar} alt={name} className="h-[32px] w-[32px] rounded-full bg-white" />}
          <div className="w-full text-sm">
            <h2 className="truncate font-medium">{name}</h2>
            <p className="truncate text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-xxs self-start text-sm text-muted-foreground">
          <Star size={16} />
          <p>{stat}</p>
        </div>
      </div>
    </Link>
  )
}
