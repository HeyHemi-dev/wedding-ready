import { PARAMS } from '@/utils/constants'
import { cn } from '@/utils/shadcn-utils'
import z from 'zod'

// export type Message = { [PARAMS.SUCCESS]: string } | { [PARAMS.ERROR]: string } | { [PARAMS.MESSAGE]: string }

const MESSAGE_TYPES = ['success', 'error', 'info'] as const
export const messageSchema = z.object({
  [PARAMS.MESSAGE]: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9\s]+$/),
  [PARAMS.MESSAGE_TYPE]: z.enum(MESSAGE_TYPES),
})

export type Message = z.infer<typeof messageSchema>

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="ui-small flex w-full max-w-md flex-col gap-sibling">
      <div
        className={cn(
          'rounded border border-border bg-background px-md py-sm text-foreground',
          message.mtype === MESSAGE_TYPES[0] && 'bg-secondary text-secondary-foreground',
          message.mtype === MESSAGE_TYPES[1] && 'bg-destructive/10 text-destructive',
          message.mtype === MESSAGE_TYPES[2] && 'bg-amber-600/10 text-foreground'
        )}>
        {message.m}
      </div>
    </div>
  )
}
