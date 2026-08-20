import type { ReactNode } from 'react'

/**
 * Base card surface: Ivory background, no border, soft ambient shadow, 16px
 * radius. Deliberately has no built-in padding — callers add their own `p-*`
 * via `className` so it never fights with a consumer's own spacing classes.
 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-(--color-surface-container-lowest) rounded-lg shadow-[0_4px_20px_rgba(45,71,57,0.04)] ${className}`}
    >
      {children}
    </div>
  )
}
