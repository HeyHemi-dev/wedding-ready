'use client'

import Link from 'next/link'

import { useAuthUser } from '@/app/_hooks/use-auth-user'
import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { AuthUserId } from '@/app/_types/users'

import { Skeleton } from '@/components/ui/skeleton'

interface CreditsListProps {
  tileId: string
  authUserId: AuthUserId
}

export function CreditsList({ tileId, authUserId }: CreditsListProps) {
  const { data: credits } = useTileCredit(tileId)
  const { data: authUser } = useAuthUser(authUserId)

  return (
    <div className="flex flex-col gap-sibling">
      {credits.map((credit) => {
        const supplierRole = authUser?.suppliers.find((s) => s.id === credit.supplierId)?.role

        return (
          <SupplierCredit
            key={credit.supplierHandle}
            name={credit.supplierName}
            contribution={credit.service}
            detail={credit.serviceDescription}
            href={`/suppliers/${credit.supplierHandle}`}
            editor={supplierRole ? authUser.id : null}
          />
        )
      })}
    </div>
  )
}

type SupplierCreditProps = {
  name: string
  contribution: string | null
  detail: string | null
  href: string
  editor: string | null
}

function SupplierCredit({ name, contribution, detail, href, editor }: SupplierCreditProps) {
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
        {editor && (
          <>
            <span>•</span>
            <p>Edit</p>
          </>
        )}
      </div>
      {detail && <div className="ui-small col-span-2 row-start-2 text-muted-foreground">{detail}</div>}
    </div>
  )
}

export function CreditsListSkeleton() {
  return (
    <div className="flex flex-col gap-sibling">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}
