'use client'

import { useTileSaveState } from '@/hooks/use-tile'
import { Button } from '../ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/utils/shadcn-utils'
import { useQueryClient } from '@tanstack/react-query'
import Form from 'next/form'
import { tileKeys } from '@/hooks/queryKeys'

interface SaveTileButtonProps {
  tileId: string
  userId: string
  className?: string
}

export function SaveTileButton({ tileId, userId, className }: SaveTileButtonProps) {
  const saveState = useTileSaveState(tileId, userId)

  // Get the current saved state from the cache
  const isSaved = saveState.data?.isSaved ?? false

  const handleClick = async () => {
    await saveState.mutate({ userId, isSaved: !isSaved })
  }

  return (
    <Form action={handleClick} className={cn('group/save-button', className)}>
      <Button variant={'link'} size={'icon'} type="submit" disabled={saveState.isPending} className={cn('rounded-full bg-accent-foreground/30')}>
        <Heart
          className={cn('h-md w-md stroke-accent transition-colors', {
            'fill-accent': isSaved,
            'group-hover/save-button:fill-accent': !isSaved,
          })}
        />
      </Button>
    </Form>
  )
}
