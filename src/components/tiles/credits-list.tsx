'use client'

import Link from 'next/link'

import { useAuthUser } from '@/app/_hooks/use-auth-user'
import { useTileCredit } from '@/app/_hooks/use-tile-credit'
import { SupplierSearchResult } from '@/app/_types/suppliers'
import { AuthUserId, User } from '@/app/_types/users'
import { AddCreditButton } from '@/components/tiles/add-credit-button'
import { RequestCreditButton } from '@/components/tiles/request-credit-button'
import { Skeleton } from '@/components/ui/skeleton'

interface CreditsListProps {
  tile: {
    id: string
    createdByUserId: string
  }
  authUserId: AuthUserId
}

export function CreditsList({ tile, authUserId }: CreditsListProps) {
  const { data: credits } = useTileCredit(tile.id)
  const { data: authUser } = useAuthUser(authUserId)

  const isTileCreator = authUserId === tile.createdByUserId
  const userSuppliers = userToSupplierSearchResults(authUser)

  return (
    <div className="flex flex-col gap-sibling">
      <div className="flex items-center justify-between gap-friend">
        <h2 className="ui-s1">Supplier credits</h2>
        {isTileCreator && <AddCreditButton tileId={tile.id} />}
        {!isTileCreator && userSuppliers && <RequestCreditButton tileId={tile.id} userSuppliers={userSuppliers} />}
      </div>
      <div className="flex flex-col gap-sibling">
        {credits.map((credit) => {
          const supplierRole = authUser?.suppliers?.find((s) => s.id === credit.supplierId)?.role

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
    </div>
  )
}

function userToSupplierSearchResults(user: User | null): SupplierSearchResult[] | null {
  if (!user?.suppliers) return null
  if (user.suppliers.length === 0) return null
  return user.suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    handle: s.handle,
  }))
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
