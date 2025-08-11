'use client'

import Link from 'next/link'

import { useTileCredit } from '@/app/_hooks/use-tile-credit'

interface CreditsListProps {
  tileId: string
}

export function CreditsList({ tileId }: CreditsListProps) {
  const { data } = useTileCredit(tileId)

  return (
    <div className="flex flex-col gap-sibling">
      {data?.map((credit) => (
        <SupplierCredit
          key={credit.supplierHandle}
          name={credit.supplierName}
          contribution={credit.serviceDescription}
          href={`/suppliers/${credit.supplierHandle}`}
        />
      ))}
    </div>
  )
}

function SupplierCredit({ name, contribution, href }: { name: string; contribution: string | null; href: string }) {
  return (
    <div className="flex flex-row items-center justify-between gap-sibling">
      <div className="flex gap-partner">
        <Link href={href} passHref>
          <h3 className="ui-small-s1 underline decoration-muted-foreground underline-offset-4">{name}</h3>
        </Link>
        <span className="ui-small text-muted-foreground">{contribution ?? ''}</span>
      </div>
    </div>
  )
}
