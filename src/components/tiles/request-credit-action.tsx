'use server'

import { TileCreditForm } from '@/app/_types/validation-schema'

export async function RequestCreditAction(tileId: string, creditData: TileCreditForm): Promise<void> {
  console.log('RequestCreditAction', tileId, creditData)

  await new Promise((resolve) => setTimeout(() => resolve(null), 1000))
}
