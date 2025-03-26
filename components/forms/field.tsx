import { Label } from '@/components/ui/label'
import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps } from 'class-variance-authority'

type FieldProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof Label> & {
    children: React.ReactNode
    label: string
  }

export default function Field({ label, children, ...labelProps }: FieldProps) {
  return (
    <div>
      <Label {...labelProps}>{label}</Label>
      {children}
    </div>
  )
}
