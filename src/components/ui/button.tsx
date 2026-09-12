'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'pressable inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
  {
    variants: {
      variant: {
        /** Main action. Dark on light sections, white on dark sections. */
        primary:
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[color-mix(in_oklch,var(--btn-primary-bg)_88%,var(--brand-blue))]',
        default:
          'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[color-mix(in_oklch,var(--btn-primary-bg)_88%,var(--brand-blue))]',
        /** Secondary action: outlined. */
        secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
        outline: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
        /** Quiet action inside dense UI. */
        ghost: 'text-ink hover:bg-surface-2',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-brand-blue-deep underline-offset-4 hover:underline rounded-none',
      },
      size: {
        clear: '',
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-5 text-[0.9375rem]',
        lg: 'h-12 px-6 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
