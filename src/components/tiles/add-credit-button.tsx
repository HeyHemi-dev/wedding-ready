'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { AddCreditForm } from './add-credit-form'

export function AddCreditButton({ tileId }: { tileId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-spouse">
          <Plus className="h-4 w-4" />
          <span>Add credit</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add credit</DialogTitle>
        <AddCreditForm tileId={tileId} setDialogOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
