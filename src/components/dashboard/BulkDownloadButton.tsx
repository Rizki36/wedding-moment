export function BulkDownloadButton({ eventId }: { eventId: string }) {
  return (
    <a href={`/api/download/${eventId}.zip`} className="rounded-full bg-(--color-fg) text-white px-6 py-3 inline-block">
      Unduh Semua
    </a>
  )
}
