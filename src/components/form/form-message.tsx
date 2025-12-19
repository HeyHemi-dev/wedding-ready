import { PARAMS } from '@/utils/constants'

export type Message = { [PARAMS.SUCCESS]: string } | { [PARAMS.ERROR]: string } | { [PARAMS.MESSAGE]: string }

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="ui-small flex w-full max-w-md flex-col gap-sibling">
      {'success' in message && <div className="rounded border border-border bg-secondary px-md py-sm text-secondary-foreground">{message.success}</div>}

      {'error' in message && <div className="rounded border border-destructive/50 bg-destructive/10 px-md py-sm text-destructive">{message.error}</div>}

      {'message' in message && <div className="rounded border border-amber-600/50 bg-amber-600/10 px-md py-sm text-foreground">{message.message}</div>}
    </div>
  )
}
