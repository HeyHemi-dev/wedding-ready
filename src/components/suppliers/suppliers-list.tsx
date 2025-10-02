import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function SuppliersGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-lg laptop:grid-cols-2 wide:grid-cols-3">{children}</div>
}

type SupplierCardProps = {
  href: string
  mainImage: string | null
  thumbnailImages: (string | null)[]
  name: string
  subtitle: string
  stat: number
  avatar?: string
}

export function SupplierCard({ name, subtitle, mainImage, thumbnailImages, stat, href, avatar }: SupplierCardProps) {
  return (
    <Link href={href} className="grid gap-sibling rounded transition-all hover:bg-primary/80 hover:shadow-contour focus:bg-primary/80">
      <div className="grid max-w-full grid-cols-3 grid-rows-2 gap-hairline overflow-hidden rounded">
        <div className="relative col-span-2 row-span-2 aspect-square bg-white">
          {mainImage && <Image src={mainImage} alt={name} fill sizes="100vw" className="object-cover" />}
        </div>
        <div className="relative aspect-square bg-white">
          {thumbnailImages[0] && <Image src={thumbnailImages[0]} alt={name} fill sizes="50vw" className="object-cover" />}
        </div>
        <div className="relative aspect-square bg-white">
          {thumbnailImages[1] && <Image src={thumbnailImages[1]} alt={name} fill sizes="50vw" className="object-cover" />}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-sibling px-2">
        <div className="flex max-w-[200px] gap-partner">
          {avatar && <Image src={avatar} alt={name} className="h-[32px] w-[32px] rounded-full bg-white" />}
          <div className="ui-small grid gap-partner">
            <h2 className="ui-small-s1">{name}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="ui-small flex items-center gap-spouse self-start text-muted-foreground">
          <Star size={16} />
          <p>{stat}</p>
        </div>
      </div>
    </Link>
  )
}
