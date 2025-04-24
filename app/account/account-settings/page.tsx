import Field from '@/components/form/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function AccountSettings() {
  return (
    <>
      <h1 className="font-serif text-4xl">Account & Security</h1>
      <div className="grid gap-md">
        <h2 className="font-serif text-2xl">Reset Handle</h2>
        <Separator />
        <h2 className="font-serif text-2xl">Reset Email and Password</h2>
        <Field label="Email">
          <Input />
        </Field>
      </div>
    </>
  )
}
