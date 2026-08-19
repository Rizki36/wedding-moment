export function QrCodeCard({ eventId, slug }: { eventId: string; slug: string }) {
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : `/e/${slug}`
  return (
    <div className="border rounded-2xl p-4 flex flex-col items-center gap-2">
      <img src={`/api/qr/${eventId}.png`} alt="QR Code Acara" className="w-48 h-48" />
      <p className="text-sm text-(--color-fg-muted) break-all">{eventUrl}</p>
      {/* Plain `<a>`, not `LinkButton` — points at an API-served file, not a router route. */}
      <a
        href={`/api/qr/${eventId}.png?download=1`}
        className="rounded-full bg-(--color-fg) text-(--color-bg) px-4 py-2 text-sm font-medium transition hover:opacity-90"
      >
        Unduh QR Code
      </a>
    </div>
  )
}
