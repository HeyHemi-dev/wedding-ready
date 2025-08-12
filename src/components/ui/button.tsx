import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/shadcn-utils'

const buttonVariants = cva(
  'py-2 inline-flex items-center justify-center whitespace-nowrap rounded  ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'ui-small-s1 bg-primary text-primary-foreground hover:bg-primary/80',
        destructive: 'ui-small-s1 bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'ui-small-s1 bg-border border hover:bg-primary/80 text-primary-foreground',
        secondary: 'ui-small-s1 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'ui-small-s1 hover:bg-primary/80 text-primary-foreground',
        link: 'text-primary-foreground underline-offset-4 hover:underline',
        input: 'justify-between rounded border border-input bg-input text-base ring-offset-background laptop:text-sm data-[placeholder]:text-muted-foreground',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-10 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
