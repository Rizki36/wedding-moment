/**
 * Arch-topped image crop — the signature photo treatment from the visual
 * reference (rounded top, square bottom). Purely presentational; caller
 * controls sizing via `className` (e.g. aspect ratio, max-width).
 */
export function ArchImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div className={`overflow-hidden rounded-t-full ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  )
}
