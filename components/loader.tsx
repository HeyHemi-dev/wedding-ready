import React from 'react'

import { cn } from '@/utils/shadcn-utils'

export function MasonryLoader() {
  const items = [
    { id: 1, ratio: 'aspect-[2/3]' },
    { id: 2, ratio: 'aspect-[3/2]' },
  ]

  return (
    <div className="grid h-full place-items-center p-md">
      <div className="grid w-24 grid-cols-2 gap-xs">
        <div className="flex flex-col gap-xs">
          {items.map((item) => (
            <div key={item.id} className={cn('flex animate-pulse bg-muted', item.ratio)}></div>
          ))}
        </div>
        <div className="flex flex-col gap-xs">
          {items.toReversed().map((item) => (
            <div key={item.id} className={cn('flex animate-pulse bg-muted', item.ratio)}></div>
          ))}
        </div>
        <div className="col-span-2 flex justify-center">
          <p className="animate-pulse text-sm text-muted-foreground">Loading</p>
        </div>
      </div>
    </div>
  )
}
