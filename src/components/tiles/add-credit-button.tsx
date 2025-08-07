'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { TileCreditForm } from './tile-credit-form'

export function AddCreditButton({ tileId }: { tileId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-spouse">
          <Plus className="h-4 w-4" />
          <span>Add credit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add credit</DialogTitle>
        </DialogHeader>
        <TileCreditForm tileId={tileId} />
      </DialogContent>
    </Dialog>
  )
}
