'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import Form from 'next/form'

import { tileKeys } from '@/app/_hooks/queryKeys'
import { useTileSaveState } from '@/app/_hooks/use-tile-saved-state'
import type { SavedTileRaw } from '@/models/types'
import { cn } from '@/utils/shadcn-utils'

import { Button } from '../ui/button'


interface SaveTileButtonProps {
  tileId: string
  authUserId: string
  className?: string
}

export function SaveTileButton({ tileId, authUserId, className }: SaveTileButtonProps) {
  const queryClient = useQueryClient()
  const saveState = useTileSaveState(tileId, authUserId)

  // Get the current saved state from the cache
  const cachedData = queryClient.getQueryData<SavedTileRaw>(tileKeys.saveState(tileId, authUserId))

  const isSaved = cachedData?.isSaved ?? false

  const handleClick = async () => {
    await saveState.mutate({ authUserId, isSaved: !isSaved })
  }

  return (
    <Form action={handleClick} className={cn('group/save-button', className)}>
      <Button variant={'link'} size={'icon'} type="submit" disabled={saveState.isPending} className={cn('rounded-full group-hover/save-button:bg-black/30')}>
        <Heart
          className={cn('h-md w-md stroke-white drop-shadow-md transition-colors', {
            'fill-white': isSaved,
            'group-hover/save-button:fill-white': !isSaved,
          })}
        />
      </Button>
    </Form>
  )
}
