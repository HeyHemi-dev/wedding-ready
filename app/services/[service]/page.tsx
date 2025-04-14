import { notFound } from 'next/navigation'

import { SuppliersList } from '@/components/suppliers/suppliers-list'
import { Area } from '@/components/ui/area'
import { Section } from '@/components/ui/section'
import { Service } from '@/db/constants'
import { SupplierModel } from '@/models/supplier'
import { paramToEnumKey, valueToPretty } from '@/utils/enum-helpers'

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const serviceKey = paramToEnumKey((await params).service, Service)
  const service = Service[serviceKey]

  if (!service) {
    notFound()
  }

  const suppliers = await SupplierModel.getAll({ service })

  return (
    <Section>
      <Area>
        <div className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h1 className="font-serif text-4xl">{valueToPretty(service)}</h1>
          </div>
          <SuppliersList suppliers={suppliers} />
        </div>
      </Area>
    </Section>
  )
}
