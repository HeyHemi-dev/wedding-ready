import * as LabelPrimitive from '@radix-ui/react-label'
import { type VariantProps } from 'class-variance-authority'
import { Info } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FormDescription, FormLabel, FormMessage } from '../ui/form'
import { FormControl } from '../ui/form'
import { FormItem } from '../ui/form'

type FieldProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof Label> & {
    children: React.ReactNode
    label: string
    hint?: string
  }

export default function Field({ label, children, hint, ...labelProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center gap-1">
        <Label {...labelProps}>{label}</Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  )
}

export function FormFieldItem({ children, label, hint, ...labelProps }: FieldProps) {
  return (
    <FormItem className="flex flex-col gap-xs">
      <FormLabel {...labelProps}>{label}</FormLabel>
      {children}
      {hint && <FormDescription>{hint}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}
