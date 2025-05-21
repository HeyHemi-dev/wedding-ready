export type Message = { success: string } | { error: string } | { message: string }

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-2 text-sm">
      {'success' in message && <div className="rounded-md border border-border bg-secondary px-md py-sm text-secondary-foreground">{message.success}</div>}
      {'error' in message && <div className="rounded-md border border-destructive/50 bg-destructive/10 px-md py-sm text-destructive">{message.error}</div>}
      {'message' in message && <div className="rounded-md border border-amber-600/50 bg-amber-600/10 px-md py-sm text-foreground">{message.message}</div>}
    </div>
  )
}
