import { Link, type LinkProps } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline'

const base = 'inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-medium text-center transition disabled:opacity-50 disabled:cursor-not-allowed'

function variantClasses(variant: ButtonVariant) {
  return variant === 'primary'
    ? `${base} bg-(--color-primary) text-(--color-on-primary) border border-transparent hover:border-(--color-primary-container)`
    : `${base} border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary-container)/40`
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
