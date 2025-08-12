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
          contribution={credit.service ?? 'Photography'}
          detail={credit.serviceDescription ?? '8 hours coverage'}
          href={`/suppliers/${credit.supplierHandle}`}
        />
      ))}
    </div>
  )
}

function SupplierCredit({ name, contribution, detail, href }: { name: string; contribution: string | null; detail: string | null; href: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-sibling gap-y-spouse">
      <div className="ui-small flex items-center gap-partner">
        <Link href={href} passHref>
          <h3 className="ui-small-s1 underline decoration-muted-foreground underline-offset-4">{name}</h3>
        </Link>
        {contribution && (
          <>
            <span>•</span>
            <p>{contribution}</p>
          </>
        )}
      </div>
      {detail && <div className="ui-small col-span-2 row-start-2 text-muted-foreground">{detail}</div>}
    </div>
  )
}
