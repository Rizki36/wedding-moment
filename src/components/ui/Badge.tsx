import type { ReactNode } from 'react'

/** Small circular accent badge (e.g. the heart-icon dot in the visual reference). */
export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--color-accent) text-white text-sm ${className}`}
    >
      {children}
    </span>
  )
}
