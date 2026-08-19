// Plain `<a>`, not `LinkButton` — this points at an API-served file
// (`/api/download/*.zip`), not a TanStack Router route, so it can't use
// `Link`'s `to` prop. Styled to match the `Button` primitive by hand.
export function BulkDownloadButton({ eventId }: { eventId: string }) {
  return (
    <a
      href={`/api/download/${eventId}.zip`}
      className="rounded-full bg-(--color-fg) text-(--color-bg) px-6 py-3 inline-block font-medium transition hover:opacity-90"
    >
      Unduh Semua
    </a>
  )
}
