import Field from '@/components/form/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/shadcn-utils'

export default function AccountSettings() {
  return (
    <div className="grid gap-acquaintance">
      <h1 className="heading-lg">Account & Security</h1>

      <div className="grid max-w-lg gap-friend">
        <div className="grid gap-partner">
          <h2 className="ui-s2">Change handle</h2>
          <p className="ui-small text-muted-foreground">
            Changing your account handle will also change your profile URL. This cannot be undone. You can only do this once every 30 days.
          </p>
        </div>
        <UpdateHandleForm />
      </div>

      <div className="grid max-w-lg gap-friend">
        <h2 className="ui-s2">Change email</h2>
        <UpdateEmailForm />
      </div>

      <div className="grid max-w-lg gap-friend">
        <h2 className="ui-s2">Change password</h2>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}

function UpdateHandleForm({ className }: { className?: string }) {
  return (
    <form className={cn('grid gap-sibling', className)}>
      <Field label="Handle">
        <Input />
      </Field>
    </form>
  )
}

function UpdateEmailForm({ className }: { className?: string }) {
  return (
    <form className={cn('grid gap-sibling', className)}>
      <Field label="Email">
        <Input type="email" />
      </Field>
    </form>
  )
}

function UpdatePasswordForm({ className }: { className?: string }) {
  return (
    <form className={cn('grid gap-sibling', className)}>
      <Field label="Current password">
        <Input type="password" />
      </Field>
      <Field label="New password">
        <Input type="password" />
      </Field>
      <Field label="Confirm new password">
        <Input />
      </Field>
    </form>
  )
}
