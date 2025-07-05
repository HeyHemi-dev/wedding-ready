'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TileCreditForm } from './tile-credit-form'

export function AddCreditButton({ tileId }: { tileId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <TileCreditForm tileId={tileId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
