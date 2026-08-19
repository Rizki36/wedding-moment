import { Link, type LinkProps } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline'

const base = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-center transition disabled:opacity-50 disabled:cursor-not-allowed'

function variantClasses(variant: ButtonVariant) {
  return variant === 'primary'
    ? `${base} bg-(--color-fg) text-(--color-bg) hover:opacity-90`
    : `${base} border border-(--color-fg) text-(--color-fg) hover:bg-(--color-fg)/5`
}

type ButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

/** Plain `<button>` primitive — use for form submits and in-page actions. */
export function Button({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${variantClasses(variant)} ${className}`} {...rest}>
      {children}
    </button>
  )
}

type LinkButtonProps = {
  variant?: ButtonVariant
  children: ReactNode
  className?: string
} & LinkProps

/** `@tanstack/react-router` `Link`-based primitive — use for navigation. */
export function LinkButton({ variant = 'primary', children, className = '', ...rest }: LinkButtonProps) {
  return (
    <Link className={`${variantClasses(variant)} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
