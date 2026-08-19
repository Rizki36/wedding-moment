import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/e/$eventSlug/thank-you')({
  component: () => (
    <div className="p-8 text-center flex flex-col items-center gap-4 mt-16">
      <h1 className="font-(--font-display) text-3xl text-(--color-fg)">Terima kasih!</h1>
      <p className="text-(--color-fg-muted)">Ucapan Anda telah tersimpan untuk pengantin.</p>
    </div>
  ),
})
